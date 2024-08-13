# AltSchool of Backend Engineering (NodeJs) Tinyuka 2023 Capstone Project
**Name:** Scissor\
**Live URL**: https://scissor.talut.tech\
**Live Api Docs**: https://scissor.talut.tech/api-docs 

## Tools Used
- [Nextjs](https://nextjs.org/)
- [Next auth v5](https://authjs.dev/getting-started/migrating-to-v5)
- [Prisma ORM](https://www.prisma.io/nextjs)
- [Postgresql](https://www.postgresql.org/)
- [Node.js v20.15.1 ](https://nodejs.org/en)

## Getting Started
1. Clone repo locally

    ```sh
    git clone https://github.com/plutack/scissor.git
    ```

2. create a .env file using the .env.sample 

    ```sh
    cp .env.sample .env
    ```
3. Run locally 

    ```sh
    npm install
    npx prisma generate
    npx prisma migrate dev
    npm run dev
    ```

## Key Frontend Routes
- Unprotected
  - / - Sign In/Register page
  - /api-docs - Stoplight element page render based on openapi.yaml file. Users can also test out the api on this page using the development or production server  
  - /[custom suffix] - redirect page to saved link url
- Protected (/dashboard/*)
  - /dashboard - User general anlytics page
  - /dashboard/link - All links created by user
  - /dashboard/link/[custom Suffix] - Specific link analytics Page

## Features
- Short links with/without custom suffix
- User analytics for all links created
- Individual links analytics
- Share directly to social media (X(formerly known as twitter :skull:), Facebook and Reddit currently supported)
- Generate and download QR code for inidvidual links
- Download individual link analytics Report (only CSV is supported)

## Upcoming Features
- Better Authentication flow
  - Oauth implementation for user authentication
  - Email verification for Users during Register Processs
  - Reset password for users
- Improved user experience 
  - Add additional routes to make use of the websocket socket implementation to fetch data
  - Improve caching of data particularly on the /dashboard/link  route
  - implement Better Search so users can search for links withput needing to load all pages 


## Credits
- **[@Kiranism](Kiranism):** For the well crafted shadcn frontend UI . Click [here](https://github.com/Kiranism/next-shadcn-dashboard-starter) to view  the dashboard repo.
- **[Shadcn/ui](https://ui.shadcn.com/)**: For the highly customisable components.





