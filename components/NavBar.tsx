"use client";

import Link from "next/link";  
import { LogoutButton } from "@/components/logout-button";
import { useMyAuthHook } from "@/context/AppUtils";

export function NavBar(){
    const { isLoading, isLoggedIn } = useMyAuthHook();
    if (isLoading) {
        return <p>Loading...</p>;
    }

    console.log("NavBar - isLoggedIn: ", {isLoggedIn});

    return (
        <nav className="navbar navbar-expand-lg px-4" style={ { backgroundColor: "#343a40" } }>
            <Link href="/" className="navbar-brand fw-bold text-white" >SupaNext</Link>          

            { isLoggedIn//user
                ? (
                    <div className="ms-auto">
                        <Link href="/Dashboard" className="me-3 text-white text-decoration-none" >Dashboard</Link>
                        <Link href="/auth/profile" className="me-3 text-white text-decoration-none" >Profile</Link>
                        <LogoutButton />
                    </div>
                ) : (
                    <div className="ms-auto">
                        <Link className="me-3 text-white text-decoration-none" href="/">Home</Link>
                        <Link className="text-white text-decoration-none" href="/auth/login">Login</Link>
                    </div>
                    )
                }            
        </nav>
    );
};