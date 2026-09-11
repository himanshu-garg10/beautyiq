"use client";

import * as React from "react";
import { ThumbsUp, ThumbsDown, Check, MessageSquare } from "lucide-react";
import { RecommendationEngineService } from "@/services/recommendation-engine.service";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useToast } from "@/context/toast-context";

interface RecommendationFeedbackWidgetProps {
  sessionId: string;
  productId: string;
}

const reasonOptions = [
  { value: "too-expensive", label: "Too Expensive" },
  { value: "not-suitable", label: "Not Suitable for My Skin" },
  { value: "not-interested", label: "Not Interested in Brand" },
  { value: "already-own", label: "Already Own / Have Tried This" },
  { value: "other", label: "Other Reason" },
];

export function RecommendationFeedbackWidget({
  sessionId,
  productId,
}: RecommendationFeedbackWidgetProps) {
  const { addToast } = useToast();
  const [feedbackSubmitted, setFeedbackSubmitted] = React.useState(false);
  const [showReasonModal, setShowReasonModal] = React.useState(false);
  const [selectedReason, setSelectedReason] = React.useState<any>("not-suitable");

  const handleHelpful = (isHelpful: boolean) => {
    if (isHelpful) {
      RecommendationEngineService.submitFeedback(sessionId, productId, true);
      setFeedbackSubmitted(true);
      addToast({
        type: "success",
        title: "Feedback Recorded",
        description: "Thank you for confirming this recommendation was helpful!",
      });
    } else {
      setShowReasonModal(true);
    }
  };

  const handleUnhelpfulSubmit = () => {
    RecommendationEngineService.submitFeedback(sessionId, productId, false, selectedReason);
    setShowReasonModal(false);
    setFeedbackSubmitted(true);
    addToast({
      type: "info",
      title: "Feedback Saved",
      description: "We'll use your input to refine future recommendation rankings.",
    });
  };

  if (feedbackSubmitted) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-status-success font-semibold py-1">
        <Check className="h-3.5 w-3.5" /> Feedback Saved
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-foreground-faint">
      <span>Was this helpful?</span>
      <button
        onClick={() => handleHelpful(true)}
        className="p-1 rounded hover:bg-background-elevated text-foreground-muted hover:text-sage-deep transition-colors"
        title="Yes, helpful recommendation"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => handleHelpful(false)}
        className="p-1 rounded hover:bg-background-elevated text-foreground-muted hover:text-status-error transition-colors"
        title="No, not suitable"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>

      {/* Unhelpful Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-lg border border-line bg-background-card p-5 shadow-xl space-y-4 text-xs">
            <h4 className="font-display font-semibold text-foreground text-sm flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-sage-deep" /> Help Us Improve Recommendation Accuracy
            </h4>

            <Select
              label="Why was this recommendation not suitable?"
              options={reasonOptions}
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
            />

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowReasonModal(false)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" className="w-full" onClick={handleUnhelpfulSubmit}>
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
