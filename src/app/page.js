"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const fetchBookmarks = async (userId) => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setBookmarks(data || []);
  };

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchBookmarks(currentUser.id);

        // Real-Time Listener
        const channel = supabase
          .channel("realtime-bookmarks")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "bookmarks" },
            () => fetchBookmarks(currentUser.id),
          )
          .subscribe();

        setLoading(false);
        return () => supabase.removeChannel(channel);
      }
      setLoading(false);
    };
    getSession();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin : "",
      },
    });
  };

  const deleteBookmark = async (id) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  const addBookmark = async (e) => {
    e.preventDefault();
    if (!user) return;
    await supabase.from("bookmarks").insert([{ title, url, user_id: user.id }]);
    setTitle("");
    setUrl("");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-indigo-600 font-bold animate-pulse">
          Syncing Library...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Modern header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              S
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              SmartMark
            </h1>
          </div>
          {user && (
            <button
              onClick={() => supabase.auth.signOut().then(() => setUser(null))}
              className="text-xs font-bold px-5 py-2.5 border border-slate-200 rounded-full hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all shadow-sm"
            >
              Sign Out
            </button>
          )}
        </header>

        {!user ? (
          /* Landing page */
          <section className="text-center py-20 animate-in fade-in zoom-in duration-700">
            <h2 className="text-5xl font-black mb-6 tracking-tighter text-slate-900">
              Your bookmarks, <br />
              <span className="text-indigo-600">everywhere.</span>
            </h2>
            <p className="text-slate-500 mb-10 text-lg max-w-sm mx-auto">
              The simple, secure, and real-time link manager for modern
              developers.
            </p>
            <button
              onClick={handleLogin}
              className="inline-flex items-center gap-3 bg-slate-900 text-white font-bold py-4 px-10 rounded-full hover:shadow-2xl hover:scale-105 transition-all shadow-xl"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt=""
                className="w-5 h-5"
              />
              Sign in with Google
            </button>
          </section>
        ) : (
          <>
            {/* Input form bar */}
            <form onSubmit={addBookmark} className="mb-16">
              <div className="flex flex-col md:flex-row gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                <input
                  placeholder="Website Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-[1] p-4 bg-transparent outline-none font-medium text-slate-700 placeholder:text-slate-400"
                  required
                />
                <div className="hidden md:block w-[1px] bg-slate-200 my-2"></div>
                <input
                  type="url"
                  placeholder="Paste URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-[2] p-4 bg-transparent outline-none font-medium text-slate-700 placeholder:text-slate-400"
                  required
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  Add Link
                </button>
              </div>
            </form>

            {/* Grid of bookmarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((b) => (
                <div
                  key={b.id}
                  className="group relative bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-300"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold border border-slate-100">
                        {b.title.charAt(0).toUpperCase()}
                      </div>
                      <button
                        onClick={() => deleteBookmark(b.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all text-xs font-black tracking-widest"
                        title="Remove Bookmark"
                      >
                        DELETE
                      </button>
                    </div>
                    <h3 className="text-lg font-bold mb-1 truncate text-slate-800">
                      {b.title}
                    </h3>
                    <p className="text-xs text-slate-400 truncate mb-6">
                      {b.url}
                    </p>

                    <a
                      href={b.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-auto inline-flex items-center justify-center py-3.5 px-4 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      Open Website
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {bookmarks.length === 0 && (
              <div className="text-center py-24 border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-slate-400 font-medium">
                  Your collection is empty. Start adding links above!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
