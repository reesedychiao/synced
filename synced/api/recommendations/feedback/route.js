import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";

export async function POST(request) {
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { songId, liked } = await request.json();

    if (!songId) {
      return NextResponse.json(
        { error: "Song ID is required" },
        { status: 400 }
      );
    }

    // This would be replaced with your actual API call to the Flask backend
    // const response = await fetch('YOUR_FLASK_API_URL/feedback', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     userId: session.user.sub,
    //     songId,
    //     liked,
    //   }),
    // });

    // For now, we'll just return a success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
