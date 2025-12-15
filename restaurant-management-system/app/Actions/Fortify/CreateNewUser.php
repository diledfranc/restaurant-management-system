<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email:rfc,dns', // Enforce RFC compliance and DNS check
                'max:255',
                Rule::unique(User::class),
            ],
            'phone' => [
                'required', 
                'string', 
                'min:10', 
                'max:20',
                'regex:/^(\+)?[0-9\s\-\(\)]+$/' // Allow +, digits, spaces, dashes, parens
            ],
            'password' => $this->passwordRules(),
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => $input['phone'],
            'password' => $input['password'],
        ]);

        // Default every self-registered user to the customer role; elevated roles are admin-assigned only.
        $customerRoleId = Role::firstOrCreate(['name' => 'customer'])->id;
        $user->roles()->syncWithoutDetaching([$customerRoleId]);

        return $user;
    }
}
