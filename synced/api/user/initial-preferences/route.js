import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";

export async function POST(request) {
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { songIds } = await request.json();

    if (!songIds || !Array.isArray(songIds) || songIds.length < 1) {
      return NextResponse.json(
        { error: "At least one song ID is required" },
        { status: 400 }
      );
    }

    // This would be replaced with your actual API call to the Flask backend
    // const response = await fetch('YOUR_FLASK_API_URL/initial-preferences', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     userId: session.user.sub,
    //     songIds,
    //   }),
    // });

    // For now, we'll just return a success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving initial preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
