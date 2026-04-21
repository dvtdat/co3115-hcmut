import { GithubIcon, LayersIcon, ServerIcon, CloudIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const TEAM_MEMBERS = [
  { id: "2252045", name: "Van Duy Anh" },
  { id: "2252607", name: "Vo Nguyen Phat" },
  { id: "2252141", name: "Doan Viet Tien Dat" },
];

const BACKEND_STACK = [
  { label: "Framework", value: "NestJS 11" },
  { label: "Language", value: "TypeScript 5.7" },
  { label: "Database", value: "MongoDB Atlas" },
];

const FRONTEND_STACK = [
  { label: "UI Runtime", value: "React 19 + Vite" },
  { label: "Language", value: "TypeScript" },
  { label: "Routing", value: "TanStack Router" },
  { label: "Server State", value: "TanStack Query" },
  { label: "UI Library", value: "shadcn/ui + Tailwind CSS v4" },
];

const DEPLOYMENT = [
  { label: "Static Hosting", value: "AWS S3", icon: <CloudIcon className="h-4 w-4" /> },
  { label: "CDN", value: "AWS CloudFront", icon: <CloudIcon className="h-4 w-4" /> },
  { label: "Backend", value: "AWS EC2 + PM2 + Nginx", icon: <ServerIcon className="h-4 w-4" /> },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-16 px-4 py-16">
      {/* Header */}
      <div className="space-y-4 text-center">
        <Badge
          variant="outline"
          className="text-primary border-primary px-3 py-1 text-xs font-medium tracking-widest uppercase"
        >
          Assignment Project
        </Badge>
        <h1 className="text-foreground text-4xl font-bold tracking-tight">About This Project</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
          A full-stack e-commerce platform built as part of the{" "}
          <span className="text-foreground font-medium">E-Commerce</span> course at{" "}
          <span className="text-foreground font-medium">
            HCMC University of Technology - VNUHCM
          </span>
          .
        </p>
      </div>

      <Separator />

      {/* Team */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <GithubIcon className="text-primary h-5 w-5" />
          <h2 className="text-foreground text-2xl font-semibold">Team Members</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TEAM_MEMBERS.map((member) => (
            <Card key={member.id} className="border-border/60">
              <CardContent className="flex flex-col gap-2 p-6">
                <span className="text-muted-foreground font-mono text-xs">{member.id}</span>
                <span className="text-foreground text-base font-semibold">{member.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* Tech Stack */}
      <section className="space-y-10">
        <div className="flex items-center gap-3">
          <LayersIcon className="text-primary h-5 w-5" />
          <h2 className="text-foreground text-2xl font-semibold">Tech Stack</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Frontend */}
          <div className="space-y-4">
            <h3 className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
              Frontend
            </h3>
            <div className="space-y-3">
              {FRONTEND_STACK.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">{item.label}</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Backend */}
          <div className="space-y-4">
            <h3 className="text-muted-foreground text-sm font-semibold tracking-widest uppercase">
              Backend
            </h3>
            <div className="space-y-3">
              {BACKEND_STACK.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">{item.label}</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Deployment */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <ServerIcon className="text-primary h-5 w-5" />
          <h2 className="text-foreground text-2xl font-semibold">Deployment</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {DEPLOYMENT.map((item) => (
            <Card key={item.label} className="border-border/60">
              <CardContent className="space-y-3 p-6">
                <div className="text-primary flex items-center gap-2">
                  {item.icon}
                  <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                    {item.label}
                  </span>
                </div>
                <p className="text-foreground text-sm font-medium">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          The frontend is a statically built Vite bundle served from an{" "}
          <span className="text-foreground font-medium">AWS S3</span> bucket, distributed globally
          via <span className="text-foreground font-medium">AWS CloudFront</span>. The backend API
          runs on an <span className="text-foreground font-medium">AWS EC2</span> instance managed
          by <span className="text-foreground font-medium">PM2</span> with{" "}
          <span className="text-foreground font-medium">Nginx</span> handling reverse proxying and
          SSL termination.
        </p>
      </section>
    </div>
  );
}
