# SmartMark: A Real-Time Bookmark Manager

I built this app to solve a simple problem: managing bookmarks across different tabs instantly without hitting the refresh button. This project was a great way for me to dive deep into **Next.js**, **Tailwind CSS**, and the real-time capabilities of **Supabase**.

## What it does

- **Smooth Google Login**: No need for passwords; just jump in with your Google account.
- **Always in Sync**: If you add or delete a link in one tab, the other one updates right before your eyes.
- **Total Privacy**: I used Row-Level Security so your bookmarks stay yours—no one else can see them.
- **Mobile Friendly**: It looks just as good on your phone as it does on your laptop.

## My Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL)
- **Hosting**: Vercel

## Technical Challenges & Solutions

### Making Deletes "Live"

One of the trickiest parts was getting the "Delete" button to update in real-time across multiple tabs. At first, it would only work for new bookmarks. I figured out that I needed to change the table's identity in the database (`REPLICA IDENTITY FULL`) so Supabase would actually send the delete signal to other tabs. It was a great lesson in how databases talk to the frontend.

### Locking Down Data

Privacy is a big deal. I spent a good amount of time writing custom SQL policies in Supabase. I wanted to make sure that even if someone knew your bookmark ID, they couldn't touch it unless they were logged in as you.

### Solving the "Infinite Loading" Screen

I ran into an issue where the app would just stay on "Loading..." if the user wasn't signed in. I had to rethink how my `useEffect` hooks were checking for sessions to make sure the app knew exactly when to show the login screen and when to show the dashboard.

Developed by **Veda Shiva Prasad**
