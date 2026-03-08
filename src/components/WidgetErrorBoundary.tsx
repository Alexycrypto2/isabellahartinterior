import { Component, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
}

class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error(`Widget "${this.props.name}" crashed:`, error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-border/30 shadow-sm rounded-2xl">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[120px]">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {this.props.name ? `${this.props.name} failed to load` : "Widget failed to load"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">This won't affect other parts of the dashboard.</p>
            </div>
            <Button size="sm" variant="outline" className="rounded-full text-xs h-8 px-4" onClick={this.handleRetry}>
              <RefreshCw className="w-3 h-3 mr-1.5" />
              Retry
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default WidgetErrorBoundary;
