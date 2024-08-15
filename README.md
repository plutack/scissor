# AltSchool of Backend Engineering (NodeJs) Tinyuka 2023 Capstone Project
**Name:** Scissor <br>
**Live URL**: https://scissor.talut.tech <br>
**Live Api Docs**: https://scissor.talut.tech/api-docs

## Tools Used
- [Nextjs](https://nextjs.org/)
- [Next auth v5](https://authjs.dev/getting-started/migrating-to-v5)
- [Prisma ORM](https://www.prisma.io/nextjs)
- [Postgresql](https://www.postgresql.org/)
- [Node.js v20.15.1 ](https://nodejs.org/en)
- [Socket.io](https://socket.io)
- [Redis](https://redis.io)

## Getting Started
1. Clone repo locally.

    ```sh
    git clone https://github.com/plutack/scissor.git
    ```

2. create a .env file using the .env.sample.

    ```sh
    cp .env.sample .env
    ```

3. Run locally.

    ```sh
    npm install
    npx prisma generate
    npx prisma migrate dev
    npm run dev
    ```
  
4. Run test locally
   ```sh
   npm run test:coverage
   ```

## Test Results
| File                       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s |
| -------------------------- | ------- | -------- | ------- | ------- | ----------------- |
| All files                  | 97.26   | 84.21    | 94.44   | 97.32   |                   |
| link-slice                 | 100     | 100      | 100     | 100     |                   |
| routes.ts                  | 100     | 100      | 100     | 100     |                   |
| ...lice/app/api/auth/login | 100     | 85.71    | 100     | 100     |                   |
| route.ts                   | 100     | 85.71    | 100     | 100     | 30                |
| ...e/app/api/auth/register | 100     | 100      | 100     | 100     |                   |
| route.ts                   | 100     | 100      | 100     | 100     |                   |
| link-slice/app/api/link    | 93.54   | 100      | 100     | 93.54   |                   |
| route.ts                   | 93.54   | 100      | 100     | 93.54   | 27,57             |
| ...e/app/api/link/[linkId] | 100     | 100      | 100     | 100     |                   |
| route.ts                   | 100     | 100      | 100     | 100     |                   |
| ...lice/app/api/link/click | 100     | 100      | 100     | 100     |                   |
| route.ts                   | 100     | 100      | 100     | 100     |                   |
| ...k/public/[customSuffix] | 100     | 100      | 100     | 100     |                   |
| route.ts                   | 100     | 100      | 100     | 100     |                   |
| .../api/link/top-countries | 100     | 100      | 100     | 100     |                   |
| route.ts                   | 100     | 100      | 100     | 100     |                   |
| ...lice/app/api/user/stats | 100     | 100      | 100     | 100     |                   |
| route.ts                   | 100     | 100      | 100     | 100     |                   |
| link-slice/constants       | 100     | 100      | 100     | 100     |                   |
| data.ts                    | 100     | 100      | 100     | 100     |                   |
| link-slice/exception       | 100     | 100      | 100     | 100     |                   |
| custom-error.ts            | 100     | 100      | 100     | 100     |                   |
| link-slice/lib             | 100     | 100      | 100     | 100     |                   |
| db.ts                      | 100     | 100      | 100     | 100     |                   |
| link-slice/schemas         | 85.71   | 100      | 0       | 85.71   |                   |
| index.ts                   | 85.71   | 100      | 0       | 85.71   | 18                |
| link-slice/services        | 99.15   | 83.33    | 100     | 98.94   |                   |
| link-service.ts            | 98.78   | 80       | 100     | 98.43   | 21                |
| user-service.ts            | 100     | 100      | 100     | 100     |                   |
| link-slice/utils           | 88.46   | 44.44    | 75      | 89.58   |                   |
| check-custom-suffix.ts     | 100     | 100      | 100     | 100     |                   |
| generate-suffix.ts         | 100     | 100      | 100     | 100     |                   |
| rate-limit.ts              | 50      | 0        | 0       | 54.54   | 11-16             |
| validate-request.ts        | 100     | 100      | 100     | 100     |                   |



## Key Frontend Routes
- Unprotected
  - / - Sign In/Register page. This page also allows unauthorized users to create short links. 
  - /api-docs - Stoplight element page render based on open api 3.1.0 specification. Users can also test out the api on this page using the development or production server. 
  - /[custom suffix] - redirect page to saved link url.
- Protected (/dashboard/*)
  - /dashboard - User general analytics page.
  - /dashboard/link - All links created by user.
  - /dashboard/link/[custom Suffix] - Specific link analytics Page.

## Features
- Short links with/without custom suffix.
- User analytics for all links created.
- Individual links analytics.
- Share directly to social media. Only X (formerly known as twitter :skull:), Facebook and Reddit are currently supported
- Generate and download QR code for individual links.
- Download individual link analytics Report. Only CSV is supported.

## Upcoming Features
- Better Authentication flow
  - Oauth implementation for user authentication.
  - Email verification for Users during Register process.
  - Reset password for users.
- Improved user experience 
  - Add additional routes to make use of the websocket implementation to fetch data.
  - Improve caching of data particularly on the /dashboard/link  route.
  - implement Better Search so users can search for links without needing to load all pages.


## Credits
- **[@Kiranism](Kiranism):** For the well crafted shadcn frontend UI . Click [here](https://github.com/Kiranism/next-shadcn-dashboard-starter) to view  the dashboard repo.
- **[Shadcn/ui](https://ui.shadcn.com/):** For the highly customizable components.
- **[Upstash](https://upstash.com/):** For provisioning a free redis instance.





