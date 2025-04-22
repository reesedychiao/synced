// "use client";

// import Link from "next/link";
// import { Button } from "../components/ui/button";
// import { Headphones, Music, Heart } from "lucide-react";
// import { login, logout } from "../lib/actions/auth";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen flex-col">
//       <header className="border-b">
//         <div className="container flex h-16 items-center justify-between">
//           <div className="flex items-center gap-2">
//             <Headphones className="h-6 w-6 ml-16" />
//             <span className="text-xl font-bold">Synced</span>
//           </div>
//           <Link href="/">
//             <Button onClick={() => login()}>Sign In</Button>
//           </Link>
//         </div>
//       </header>
//       <main className="flex-1">
//         <section className="container py-12 md:py-24 lg:py-32">
//           <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
//             <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
//               Find Your Sound, Find Your Match
//             </h1>
//             <div className="flex flex-col gap-4 sm:flex-row">
//               <Link href="/">
//                 <Button size="lg" onClick={() => login()}>
//                   Get Started
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </section>
//         <section className="container py-12 md:py-24 lg:py-32">
//           <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
//             <div className="flex flex-col items-center gap-2 rounded-lg border p-6 text-center">
//               <div className="rounded-full bg-primary/10 p-3">
//                 <Music className="h-6 w-6 text-primary" />
//               </div>
//               <h3 className="text-xl font-bold">Discover Music</h3>
//               <p className="text-muted-foreground">
//                 Find new songs and artists based on your preferences.
//               </p>
//             </div>
//             <div className="flex flex-col items-center gap-2 rounded-lg border p-6 text-center">
//               <div className="rounded-full bg-primary/10 p-3">
//                 <Heart className="h-6 w-6 text-primary" />
//               </div>
//               <h3 className="text-xl font-bold">Match Your Taste</h3>
//               <p className="text-muted-foreground">
//                 Our algorithm learns what you love and recommends similar
//                 tracks.
//               </p>
//             </div>
//             <div className="flex flex-col items-center gap-2 rounded-lg border p-6 text-center">
//               <div className="rounded-full bg-primary/10 p-3">
//                 <Headphones className="h-6 w-6 text-primary" />
//               </div>
//               <h3 className="text-xl font-bold">Simple Interface</h3>
//               <p className="text-muted-foreground">
//                 Swipe left or right on songs to refine your musical profile.
//               </p>
//             </div>
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }

"use client";

import { signIn, signOut } from "next-auth/react"; // Import correctly from next-auth/react

const LoginButton = () => {
  const handleLogin = async () => {
    await signIn("github", { redirectTo: "/" });
  };

  return <button onClick={handleLogin}>Login with GitHub</button>;
};

const LogoutButton = () => {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default function Home() {
  return (
    <div>
      <LoginButton />
      <LogoutButton />
    </div>
  );
}
