"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SocialPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("friends");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6 dark:text-gray-100">Social</h1>
      
      <Tabs defaultValue="friends" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger 
            value="friends" 
            className="flex-1 px-6 py-2 text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
          >
            Friends
          </TabsTrigger>
          <TabsTrigger 
            value="discover" 
            className="flex-1 px-6 py-2 text-sm font-medium rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
          >
            Discover
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}