import { SignInForm } from "@/components/signin-form"
import { Code2, GitBranch, Github } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row dark">
      {/* Left side - Branding */}
      <div className="flex-1 bg-card p-8 lg:p-12 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Github className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">CodeHub</span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-balance text-foreground">
              Build amazing things together
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Access repositories, collaborate with developers, and manage your code projects all in one place.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 max-w-md mt-12">
          <div>
            <div className="text-3xl font-bold text-primary mb-1">10M+</div>
            <div className="text-sm text-muted-foreground">Repositories</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-1">50M+</div>
            <div className="text-sm text-muted-foreground">Developers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-1">200+</div>
            <div className="text-sm text-muted-foreground">Languages</div>
          </div>
        </div>
      </div>

      {/* Right side - Sign in form */}
      <div className="flex-1 bg-background p-8 lg:p-12 flex items-center justify-center">
        <SignInForm />
      </div>
    </div>
  )
}
