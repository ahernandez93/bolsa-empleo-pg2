"use client"

import { LoginFormCandidate } from "@/components/login-form-candidate"
import { motion } from "framer-motion"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <LoginFormCandidate />
        </motion.div>
      </div>
    </div>
  )
}

