# Apple Pie Club Soen341 Project 2025

This is purely a university project.

## Overview of the project

ChatHaven is a versatile communication platform designed for seamless interaction through text channels and direct messaging. Whether you’re collaborating with a team or connecting with a community, ChatHaven offers an intuitive space to stay connected. Users can enjoy customizable features that enhance their experience in a clean interface. ChatHaven is the perfect platform for meaningful and efficient communication!

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Problem Statement

In today's digital world, many platforms do not provide clear distinctions between super admins, admins, and members, making it difficult to manage channels. Additionally, users need a centralized place to see all channels, while only being able to access the ones they have permissions for.

## Our proposed solution

ChatHaven is a communication platform that solves these issues by implementing the following

#### Structured Role Management:

- Super Admins: Have full access to create, delete, and moderate all channels and teams.
- Admins: Can create and delete channels, assign users to channels, and moderate messages in their assigned channels.
- Members: Can see a list of all channels but only access those they are assigned to.

#### Channel Organization:

- Users can join structured channels such as “General,” “Project Help,” and “Social.”
- Channels are visible to all users, but restricted ones are grayed out for users who do not have access.
- Admins can manage channel assignments to allow proper access.

#### Direct Messaging (DM) System:

- Users can privately message others.
- DMs are accessible only by the participants.

#### Granular Access Control:

- Members see a full list of channels but only have access to their assigned ones.
- Lower-level admins can only moderate specific channels.
- Higher-level admins (Super Admins) can manage and moderate all channels.

## Tech Stack

- Frontend: React.js
- Backend: Next.js
- Database: MongoDB with Mongoose
- Authentication: JWT (JSON Web Tokens)
- Styling: CSS
- Deployment: TBD

## Who's the power team behind ChatHaven?

- Hugo Moslener – 40241091
- Mohamed Ahmed – 40229758
- Darcy McCoy – 40234556
- Matthew Lucas Santiago – 40284787
- Marwa Hammani – 40289362
- Justyne Phan – 40278509

## Getting Started

First, run the development server.
Make sure that you have the correct `MANGODB_URI` in your `.env` file?

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contact Us!

For any questions or concerns, reach out to us at support@chathaven.com. We will be more than happy to assist!
