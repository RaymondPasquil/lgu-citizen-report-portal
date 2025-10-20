import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: 'email',
      name: 'Email',
      type: 'email',
      from: process.env.EMAIL_FROM || 'noreply@lgu.gov.ph',
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
    },
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const profile = await prisma.profile.findUnique({
          where: { userId: user.id },
          include: { department: true, barangay: true }
        })
        
        if (profile) {
          token.role = profile.role
          token.departmentId = profile.departmentId
          token.barangayId = profile.barangayId
          token.profileId = profile.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.departmentId = token.departmentId as string
        session.user.barangayId = token.barangayId as string
        session.user.profileId = token.profileId as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
}