'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Catches anything the renderer throws — context creation failure, a shader
 * that will not compile, a driver quirk — and hands control back to the
 * semantic presentation. The visitor sees the story continue, never an error
 * wall and never a reload loop.
 */
export class RendererBoundary extends Component<
  { onFailure: (reason: string) => void; children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // The reason is a coarse category, never the visitor's data.
    this.props.onFailure('renderer-exception');
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ag] renderer failed', error, info.componentStack);
    }
  }

  override render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
