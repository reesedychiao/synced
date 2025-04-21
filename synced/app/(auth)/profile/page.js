"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Music, Heart, User } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="container flex h-[500px] items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Not Logged In</h1>
        <p className="mb-6">Please log in to view your profile.</p>
        <Link href="/api/auth/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-background shadow-lg">
          {user.picture ? (
            <img
              src={user.picture || "/placeholder.svg"}
              alt={user.name || "User avatar"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Tabs defaultValue="liked">
        <TabsList className="mb-8 grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="liked">
            <Heart className="mr-2 h-4 w-4" />
            Liked Songs
          </TabsTrigger>
          <TabsTrigger value="stats">
            <Music className="mr-2 h-4 w-4" />
            Music Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liked">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* This would be populated with actual liked songs from your API */}
            <Card>
              <CardHeader className="p-0">
                <img
                  src="/placeholder.svg?height=200&width=200"
                  alt="Album cover"
                  className="aspect-square w-full object-cover"
                />
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold">Blinding Lights</h3>
                <p className="text-sm text-muted-foreground">The Weeknd</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-0">
                <img
                  src="/placeholder.svg?height=200&width=200"
                  alt="Album cover"
                  className="aspect-square w-full object-cover"
                />
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold">Bad Guy</h3>
                <p className="text-sm text-muted-foreground">Billie Eilish</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-0">
                <img
                  src="/placeholder.svg?height=200&width=200"
                  alt="Album cover"
                  className="aspect-square w-full object-cover"
                />
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-semibold">Levitating</h3>
                <p className="text-sm text-muted-foreground">Dua Lipa</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Genres</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <span>Pop</span>
                    <span className="text-sm text-muted-foreground">65%</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>R&B</span>
                    <span className="text-sm text-muted-foreground">20%</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Rock</span>
                    <span className="text-sm text-muted-foreground">10%</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Hip-Hop</span>
                    <span className="text-sm text-muted-foreground">5%</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Artists</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <span>The Weeknd</span>
                    <span className="text-sm text-muted-foreground">
                      12 songs
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Billie Eilish</span>
                    <span className="text-sm text-muted-foreground">
                      8 songs
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Dua Lipa</span>
                    <span className="text-sm text-muted-foreground">
                      6 songs
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Harry Styles</span>
                    <span className="text-sm text-muted-foreground">
                      5 songs
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
