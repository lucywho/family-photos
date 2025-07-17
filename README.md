### The Challenge
My parents have 70+ years worth of family photos digitised and saved on thumb drives in, apparently, no particular order. My BackEnd Guy ([Tim Duckett](https://github.com/timd) ) dumped them all into an AWS S3 bucket, now I'm trying to present them in a way that makes some kind of sense and is easy for my tech-wary parents to use

### The Solution (so far)
Simple registration with email verification and approval by an admin

Registration, login and "continue as guest" options on the first screen, for easy navigation

Three user roles:
- admin:
  - can manage users by approving, removing and changing roles.
  - can manage albums, information and tags on individual photos.
  - can set individual photos to "family-only" viewing.
  - cannot delete photos completely. 
- member: can see all photos in all albums
- guest: can see public photos
 
Albums are displayed in alphabetical order after login, and clicking on an album displays all the photos.

Click on an individual photo to see a larger image and more information about the photo. Admins will see an "edit" option here.

The user can scroll between individual photo views, and when then return to the album view, it will scroll to the last viewed image.

#### Security
- Email verification for new registrations, followed by manual admin approval. Admins only see users who have verified their email address.
- Forgot password option allows password resets with email verification
- Login gives non-specific error message for invalid email or password so it is not possible to tell if a specific email is registered
- Images can be set to "family-only" for privacy

#### Idiot-proofing 
All user inputs are validated on front and back end
Duplication of album names and tags is prevented
"All Photos" album contains every image in the bucket. It is not possible to edit this album. Admins can remove photos from other albums, but cannot delete them entirely.
The Guest user account used by anyone using the "Continue as Guest" feature cannot be edited by admins.

### Tech stack
- Next.js
- TypeScript
- zod
- Prisma
- Postgres database in a Docker container for development, which I then deployed to Vercel 
- Authorisation with nextauth
- Emails from SES
- Images stored in an S3 bucket
- Styling with Tailwind CSS and shadcn/ui components

### Next steps
- search on tags and dates
- upload new photos (include capture of metadata to populate the the photo information fields
- light and dark mode
