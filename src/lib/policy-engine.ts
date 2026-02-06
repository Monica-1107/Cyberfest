'use client';

/**
 * @fileOverview Policy Enforcement Engine
 * Centralized logic for checking, broadcasting, and enforcing privacy choices.
 */

export type ConsentCategory = 'necessary' | 'analytics' | 'marketing' | 'functional' | 'personalization';

export interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  personalization: boolean;
}

const EVENT_NAME = 'pp_policy_update';

class PolicyEngine {
  private currentConsent: ConsentState = {
    necessary: true,
    analytics: false,
    marketing: false,
    functional: false,
    personalization: false,
  };

  /**
   * Broadcasts a new policy state to the entire application.
   */
  public updatePolicy(newState: ConsentState) {
    this.currentConsent = { ...newState, necessary: true };
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { 
        detail: this.currentConsent 
      }));
    }
  }

  /**
   * gatekeeper function for scripts to check if they have permission to execute.
   */
  public checkConsent(category: ConsentCategory): boolean {
    if (category === 'necessary') return true;
    return this.currentConsent[category] || false;
  }

  /**
   * Allows components to subscribe to real-time policy changes.
   */
  public subscribe(callback: (state: ConsentState) => void) {
    if (typeof window === 'undefined') return () => {};

    const handler = (event: any) => callback(event.detail);
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }

  /**
   * Returns the current snapshot of the policy.
   */
  public getSnapshot(): ConsentState {
    return { ...this.currentConsent };
  }
}

export const policyEngine = new PolicyEngine();
