"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus, AlertTriangle } from "lucide-react";
import { RubricCriterionData } from "@/types/features";
import { Checkbox } from "@/components/ui/checkbox";

interface RubricCriteriaTableProps {
  criteria: RubricCriterionData[];
  onCriteriaChange: (updatedCriteria: RubricCriterionData[]) => void;
  isReadOnly?: boolean;
}

export function RubricCriteriaTable({
  criteria,
  onCriteriaChange,
  isReadOnly = false,
}: RubricCriteriaTableProps) {
  const [scoreInputs, setScoreInputs] = useState<string[]>([]);

  useEffect(() => {
    setScoreInputs(criteria.map((c) => String(c.maxScore)));
  }, [criteria]);

  const handleFieldChange = (
    index: number,
    field: keyof RubricCriterionData,
    value: string | number | boolean,
  ) => {
    const newCriteria = [...criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    onCriteriaChange(newCriteria);
  };

  const handleScoreInputChange = (index: number, value: string) => {
    const newScoreInputs = [...scoreInputs];
    newScoreInputs[index] = value;
    setScoreInputs(newScoreInputs);
  };

  const handleScoreInputBlur = (index: number) => {
    const value = scoreInputs[index];
    const parsedValue = value === "" ? 0 : Number.parseInt(value, 10);
    const finalValue = isNaN(parsedValue) || parsedValue < 0 ? 0 : parsedValue;
    handleFieldChange(index, "maxScore", finalValue);
  };

  const handleAddCriterion = () => {
    const newCriterion: RubricCriterionData = {
      name: "",
      description: "",
      maxScore: 10,
      isCommon: false,
    };
    onCriteriaChange([...criteria, newCriterion]);
  };

  const handleRemoveCriterion = (index: number) => {
    onCriteriaChange(criteria.filter((_, i) => i !== index));
  };

  if (criteria.length === 0 && !isReadOnly) {
    return (
      <div className="p-8 text-center border-dashed border-2 rounded-lg">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Criteria Added</h3>
        <p className="text-muted-foreground mb-4">
          Add criteria to your rubric to get started.
        </p>
        <Button
          onClick={handleAddCriterion}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add First Criterion
        </Button>
      </div>
    );
  }

  if (criteria.length === 0 && isReadOnly) {
    return (
      <div className="p-8 text-center border-dashed border-2 rounded-lg">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Criteria</h3>
        <p className="text-muted-foreground mb-4">
          This rubric has no criteria defined.
        </p>
      </div>
    );
  }

  const totalScore = criteria.reduce(
    (total, criterion) => total + (criterion.maxScore || 0),
    0,
  );

  return (
    <div className="w-full overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%]">Criterion Name</TableHead>
            <TableHead className="w-[45%]">Description</TableHead>
            <TableHead className="w-[10%] text-center">Max Score</TableHead>
            <TableHead className="w-[10%] text-center">Is Common</TableHead>
            {!isReadOnly && (
              <TableHead className="w-[10%] text-right pr-6">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {criteria.map((criterion, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  value={criterion.name}
                  onChange={(e) =>
                    handleFieldChange(index, "name", e.target.value)
                  }
                  placeholder="e.g. Code Quality"
                  readOnly={isReadOnly}
                  className="bg-transparent border-0 rounded-none focus-visible:ring-1"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={criterion.description}
                  onChange={(e) =>
                    handleFieldChange(index, "description", e.target.value)
                  }
                  placeholder="e.g. Assesses the quality and cleanliness of the code"
                  readOnly={isReadOnly}
                  className="bg-transparent border-0 rounded-none focus-visible:ring-1"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={scoreInputs[index] ?? ""}
                  onChange={(e) =>
                    handleScoreInputChange(index, e.target.value)
                  }
                  onBlur={() => handleScoreInputBlur(index)}
                  min="0"
                  className="w-full text-center bg-transparent border-0 rounded-none focus-visible:ring-1"
                  readOnly={isReadOnly}
                />
              </TableCell>
              <TableCell className="text-center">
                <Checkbox
                  checked={criterion.isCommon}
                  onCheckedChange={(checked) =>
                    handleFieldChange(index, "isCommon", !!checked)
                  }
                  disabled={isReadOnly}
                />
              </TableCell>
              {!isReadOnly && (
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCriterion(index)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center p-2 border-t bg-muted/50">
        {!isReadOnly && (
          <Button onClick={handleAddCriterion} variant="link" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Criterion
          </Button>
        )}
        <div
          className={`font-semibold text-right pr-4 ${
            isReadOnly ? "w-full" : "w-1/2"
          }`}
        >
          Total Score: {totalScore}
        </div>
      </div>
    </div>
  );
}
