<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\Order;
use App\Models\MenuItem;
use App\Models\Modifier;
use App\Models\Delivery;
use App\Services\InventoryService;
use Laravel\Cashier\Cashier;

class PaymentController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function checkout(Request $request)
    {
        $user = Auth::user();
        $cart = $request->input('cart');
        $guestName = $request->input('guest_name');
        $guestPhone = $request->input('guest_phone');
        $guestAddress = $request->input('guest_address');
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Create pending order
        $order = Order::create([
            'user_id' => $user->id,
            'guest_name' => $guestName ?? $user->name,
            'guest_phone' => $guestPhone ?? ($user->phone ?? ''),
            'guest_address' => $guestAddress ?? ($user->address ?? ''),
            'total_cents' => 0,
            'payment_method' => 'online',
            'status' => 'pending_payment',
        ]);

        if ($guestAddress) {
            Delivery::create([
                'order_id' => $order->id,
                'status' => 'pending',
            ]);
        }

        $totalCents = 0;
        $lineItems = [];

        foreach ($cart as $item) {
            $menuItem = MenuItem::find($item['id']);
            if (!$menuItem) continue;

            $quantity = $item['quantity'];
            $itemPrice = $menuItem->price_cents;
            $modifiersTotal = 0;
            
            // Create OrderItem
            $orderItem = $order->items()->create([
                'menu_item_id' => $menuItem->id,
                'quantity' => $quantity,
                'unit_price_cents' => $itemPrice,
                'total_price_cents' => 0,
                'cost_cents' => $menuItem->cost_cents,
            ]);

            $modifierAttachments = [];
            if (isset($item['modifiers']) && is_array($item['modifiers'])) {
                foreach ($item['modifiers'] as $modData) {
                    $mod = Modifier::find($modData['modifier_id']);
                    if ($mod) {
                        $modifiersTotal += $mod->price_cents;
                        $modifierAttachments[$mod->id] = [
                            'modifier_name' => $mod->name,
                            'price_cents' => $mod->price_cents,
                        ];
                    }
                }
                $orderItem->modifiers()->attach($modifierAttachments);
            }

            $itemTotal = ($itemPrice + $modifiersTotal) * $quantity;
            $orderItem->update(['total_price_cents' => $itemTotal]);
            $totalCents += $itemTotal;

            $lineItems[] = [
                'price_data' => [
                    'currency' => 'thb',
                    'product_data' => [
                        'name' => $menuItem->name . (count($modifierAttachments) > 0 ? ' (+ modifiers)' : ''),
                    ],
                    'unit_amount' => $itemPrice + $modifiersTotal,
                ],
                'quantity' => $quantity,
            ];
        }

        $order->update(['total_cents' => $totalCents]);

        $checkout_session = $user->checkout($lineItems, [
            'success_url' => route('payment.success') . '?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('payment.cancel') . '?order_id=' . $order->id,
            'payment_method_types' => ['card', 'promptpay'],
            'metadata' => [
                'order_id' => $order->id,
            ],
        ]);

        return response()->json(['url' => $checkout_session->url]);
    }

    public function success(Request $request)
    {
        $sessionId = $request->get('session_id');

        if ($sessionId) {
            $session = Cashier::stripe()->checkout->sessions->retrieve($sessionId);
            
            if ($session->payment_status === 'paid') {
                $orderId = $session->metadata->order_id ?? null;
                if ($orderId) {
                    $order = Order::with('items.menuItem.ingredients', 'items.modifiers.ingredients')->find($orderId);
                    if ($order && $order->status === 'pending_payment') {
                        $order->update(['status' => 'placed']);
                        
                        // Deduct inventory
                        foreach ($order->items as $item) {
                            $menuItem = $item->menuItem;
                            if ($menuItem) {
                                foreach ($menuItem->ingredients as $ingredient) {
                                    $this->inventoryService->consumeStock($ingredient, $ingredient->pivot->quantity * $item->quantity);
                                }
                            }
                            
                            foreach ($item->modifiers as $mod) {
                                foreach ($mod->ingredients as $ingredient) {
                                    $this->inventoryService->consumeStock($ingredient, $ingredient->pivot->quantity * $item->quantity);
                                }
                            }
                        }

                        \App\Events\OrderPlaced::dispatch($order);
                    }
                }
                return redirect()->route('customer.orders')->with('success', 'Payment successful! Your order has been placed.');
            }
        }

        return redirect()->route('shop.cart')->with('error', 'Payment failed or was cancelled.');
    }

    public function cancel(Request $request)
    {
        $orderId = $request->get('order_id');
        if ($orderId) {
            $order = Order::find($orderId);
            if ($order && $order->status === 'pending_payment') {
                $order->update(['status' => 'cancelled']);
            }
        }
        return redirect()->route('shop.cart')->with('error', 'Payment cancelled.');
    }
}
