import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Setup from "@/pages/Setup";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/inbox" component={Home} />
      <Route path="/starred" component={Home} />
      <Route path="/sent" component={Home} />
      <Route path="/drafts" component={Home} />
      <Route path="/trash" component={Home} />
      <Route path="/category/:id" component={Home} />
      <Route path="/setup" component={Setup} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
