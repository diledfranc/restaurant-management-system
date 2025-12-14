import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowRight, UtensilsCrossed, ChefHat, Star } from 'lucide-react';
import { type SharedData } from '@/types';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import * as shop from '@/routes/shop';
import CustomerNavbar from '@/components/customer-navbar';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome to MOMO" />
            
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                <CustomerNavbar />

                <main className="flex-1">
                    {/* Hero Section */}
                    <section className="relative py-12 md:py-32 overflow-hidden">
                        <div className="container mx-auto px-4 relative z-10">
                            <div className="max-w-2xl">
                                <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight mb-4 md:mb-6">
                                    Taste the <span className="text-primary">Difference</span> <br />
                                    in Every Bite.
                                </h1>
                                <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-lg">
                                    Premium beans, expert baristas, and a cozy atmosphere. Experience the best coffee in town.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    <Link href={shop.menu().url}>
                                        <Button size="lg" className="w-full sm:w-auto gap-2">
                                            Order Now <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                            Join Rewards
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        
                        {/* Abstract Background Decoration */}
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[300px] h-[300px] md:w-[800px] md:h-[800px] bg-primary/10 rounded-full blur-3xl -z-10" />
                    </section>

                    {/* Features Grid */}
                    <section id="features" className="py-12 md:py-20 bg-muted/50">
                        <div className="container mx-auto px-4">
                            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
                                <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Why Choose Us?</h2>
                                <p className="text-sm md:text-base text-muted-foreground">
                                    We don't just make food. We make people's days. Built on quality, speed, and a whole lot of flavor.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                                <div className="bg-background p-6 md:p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                    <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 md:mb-6">
                                        <ChefHat className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Fresh Ingredients</h3>
                                    <p className="text-sm md:text-base text-muted-foreground">
                                        We source our produce daily from local farms to ensure the crispest lettuce and juiciest tomatoes.
                                    </p>
                                </div>
                                <div className="bg-background p-6 md:p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                    <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 md:mb-6">
                                        <UtensilsCrossed className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Flame Grilled</h3>
                                    <p className="text-sm md:text-base text-muted-foreground">
                                        Our signature cooking method locks in the flavor and gives our burgers that distinct smoky taste.
                                    </p>
                                </div>
                                <div className="bg-background p-6 md:p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                                    <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4 md:mb-6">
                                        <Star className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">Top Rated</h3>
                                    <p className="text-sm md:text-base text-muted-foreground">
                                        Voted #1 Burger Joint in the city for 3 years running. Come see what the hype is about.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="py-12 md:py-20">
                        <div className="container mx-auto px-4">
                            <div className="bg-primary text-primary-foreground rounded-2xl p-6 md:p-16 text-center relative overflow-hidden">
                                <div className="relative z-10 max-w-2xl mx-auto">
                                    <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">Ready to satisfy your cravings?</h2>
                                    <p className="text-base md:text-lg opacity-90 mb-6 md:mb-8">
                                        Browse our menu and order your favorites today. Sign up to earn points on every purchase!
                                    </p>
                                    <Link href={shop.menu().url}>
                                        <Button size="lg" variant="secondary" className="font-bold">
                                            View Full Menu
                                        </Button>
                                    </Link>
                                </div>
                                
                                {/* Decorative circles */}
                                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
                                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2" />
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="bg-muted py-12 border-t">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <div className="flex items-center gap-2 font-bold text-xl mb-4">
                                    <UtensilsCrossed className="h-5 w-5" />
                                    <span>Burger King Clone</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Serving happiness, one burger at a time.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4">Menu</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li><Link href="#" className="hover:text-foreground">Burgers</Link></li>
                                    <li><Link href="#" className="hover:text-foreground">Sides</Link></li>
                                    <li><Link href="#" className="hover:text-foreground">Drinks</Link></li>
                                    <li><Link href="#" className="hover:text-foreground">Desserts</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4">Company</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li><Link href="#" className="hover:text-foreground">About Us</Link></li>
                                    <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
                                    <li><Link href="#" className="hover:text-foreground">Locations</Link></li>
                                    <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4">Legal</h4>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
                                    <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
                            &copy; {new Date().getFullYear()} Burger King Clone. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
