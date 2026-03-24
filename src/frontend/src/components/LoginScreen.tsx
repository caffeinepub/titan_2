import { Button } from "@/components/ui/button";
import { Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-glow">
            <span className="text-primary-foreground font-black text-3xl">
              T
            </span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">
            Titan
          </h1>
          <p className="text-muted-foreground text-sm">
            The exclusive social platform
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {[
            { icon: Shield, text: "Secure Internet Identity login" },
            { icon: Zap, text: "Real-time posts and messaging" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-foreground">{text}</span>
            </div>
          ))}
        </div>

        {/* Login Button */}
        <Button
          className="w-full h-12 bg-primary hover:bg-accent text-primary-foreground font-semibold text-base rounded-xl shadow-glow transition-all"
          onClick={() => login()}
          disabled={isLoggingIn}
          data-ocid="login.primary_button"
        >
          {isLoggingIn ? "Connecting..." : "Sign in with Internet Identity"}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Built on the Internet Computer Protocol
        </p>
      </motion.div>
    </div>
  );
}
