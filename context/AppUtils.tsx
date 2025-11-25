"use client";

import Loader from "@/components/Loader";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface AppUtilsType{
    isLoggedIn: boolean, // I don't use useState because i set it finally based on user presence
    user: User | null,
    isLoading: boolean,
    fetchUser: () => Promise<void>, // For returning the user on demand
}

const AppUtilsContext = createContext<AppUtilsType|undefined>(undefined)

export const AppUtilsProvider = ({children}: {children: React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true)

    const supabase = createClient();

    async function fetchUser() {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                throw error;
                setUser(null);
            } else {    
                setUser(data.user);
            }
        } catch (err) {
            console.error("Error fetching user:", err);
            setUser(null);
        }
        finally {
            setIsLoading(false);
        }
    }

    useEffect( () => {
        fetchUser();

        // Set up listener for auth state changes
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        });

        // Cleanup listener on unmount
        return () => {
            listener.subscription.unsubscribe();
        };
    }, [])

    return (
        <AppUtilsContext.Provider value={{ 
            user,
            isLoggedIn: !!user,
            isLoading,
            fetchUser, //optional. May be used to refresh user on demand, when the profile is changed
        }}
        >
            { isLoading ? <Loader /> : children}
        </AppUtilsContext.Provider>
    );
}

export const useMyAuthHook = () => {
    const context = useContext(AppUtilsContext);
    if(!context){
        throw new Error("App Utils functions must be wrapped inside AppUtils Provider");
    }
    return context;
}