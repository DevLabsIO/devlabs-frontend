"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ScoreSliderProps {
  score: number;
  maxScore: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

export function ScoreSlider({
  score,
  maxScore,
  onChange,
  disabled = false,
  className,
}: ScoreSliderProps) {
  const [inputValue, setInputValue] = useState(score.toString());
  const [isFocused, setIsFocused] = useState(false);
  const previousScoreRef = useRef(score);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(score.toString());
      previousScoreRef.current = score;
    }
  }, [score, isFocused]);

  const handleScoreClick = (value: number) => {
    if (onChange && !disabled) {
      onChange(value);
    }
  };

  const handleClearScore = () => {
    if (onChange && !disabled) {
      onChange(0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    if (inputValue === "" || inputValue === ".") {
      setInputValue(previousScoreRef.current.toString());
    } else {
      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue)) {
        const clampedValue = Math.max(0, Math.min(maxScore, numValue));
        if (onChange && !disabled) {
          onChange(clampedValue);
        }
        setInputValue(clampedValue.toString());
        previousScoreRef.current = clampedValue;
      } else {
        setInputValue(previousScoreRef.current.toString());
      }
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    previousScoreRef.current = score;

    setInputValue("");
    e.target.select();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const wholeNumberScores = Array.from({ length: maxScore + 1 }, (_, i) => i);

  const isDecimalScore = score % 1 !== 0;

  const scores = isDecimalScore
    ? [...wholeNumberScores, score].sort((a, b) => a - b)
    : wholeNumberScores;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Select Score:
          </span>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              disabled={disabled}
              className="w-24 h-10 text-center text-lg font-bold"
              placeholder="0"
            />
            <span className="text-sm text-muted-foreground">/ {maxScore}</span>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClearScore}
          disabled={disabled || score === 0}
          className="gap-1.5"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {scores.map((value) => {
          const isSelected = score === value;
          const isDecimal = value % 1 !== 0;

          return (
            <Button
              key={value}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="lg"
              disabled={disabled}
              onClick={() => handleScoreClick(value)}
              className={cn(
                "relative min-w-[3rem] h-12 text-base font-semibold transition-all",
                isSelected && "ring-2 ring-primary ring-offset-2",
                !isSelected && "hover:border-primary/50 hover:bg-primary/5",
                isDecimal && !isSelected && "border-dashed border-2",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <div className="flex items-center gap-1">
                {value}
                {isSelected && <Check className="h-3.5 w-3.5" />}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
