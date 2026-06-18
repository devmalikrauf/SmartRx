import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'placeholder-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder-secret',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || 'placeholder-secret',
  // Rest of the NextAuth configuration will be filled in when we implement authentication.
});

export { handler as GET, handler as POST };
