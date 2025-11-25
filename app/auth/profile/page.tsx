"use client";

import { useMyAuthHook } from "@/context/AppUtils";

export default function ProfilePage() {
    const { isLoggedIn, isLoading, user } = useMyAuthHook();    
    if (isLoading) {
        return <p>Loading profile...</p>;
    }
    
    if (!isLoggedIn) {
        return (
            <>
                <div className="container mt-5">
                    <h2>Profile</h2>
                    <p>You need to be logged in to view your profile.</p>
                </div>
            </>
        );
    }
    
    return (
        <>
            <div className="container mt-5">
                <h2>Profile</h2>
                <div className="card p-4 shadow-sm">
                    <p><strong>ID:</strong> {user?.id}</p>
                    <p><strong>Name:</strong> {user?.user_metadata.full_name}</p>
                    <p><strong>Email:</strong> {user?.email} </p>
                    <p><strong>Phone:</strong> N/A</p>
                    <p><strong>Gender:</strong> N/A</p>
                </div>
            </div>
        </>
    );
}