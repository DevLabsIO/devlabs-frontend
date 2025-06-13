"use client";
import { useState, useEffect } from "react";
import { ViewToggle, ViewMode } from "@/components/view-toggle";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { DataGrid } from "@/components/data-grid/data-grid";
import { GridItem } from "@/components/data-grid/grid-item";
import { Team } from "@/types/types";
import { Users, PlusCircle } from "lucide-react";
import { getColumns } from "@/components/teams/team-columns";
import { useTeams } from "@/components/teams/hooks/use-teams";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import teamQueries from "@/repo/team-queries/team-queries";
import { toast } from "sonner";
import { TeamForm } from "@/components/teams/team-form";
import {
  CreateTeamRequest,
  UpdateTeamRequest,
} from "@/components/teams/types/types";

function useTeamsForDataTable(
  page: number,
  pageSize: number,
  search: string,
  dateRange: { from_date: string; to_date: string },
  sortBy: string,
  sortOrder: string
) {
  return useTeams(search, page - 1, pageSize, sortBy, sortOrder as "asc" | "desc");
}

useTeamsForDataTable.isQueryHook = true;

export default function TeamsPage() {
  const [viewmode, setViewMode] = useState<ViewMode>("table");
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleMutationSuccess = (action: "created" | "updated") => {
    toast.success(`Team ${action} successfully`);
    queryClient.invalidateQueries({ queryKey: ["teams"] });
    setIsFormOpen(false);
    setTeamToEdit(null);
  };

  const handleMutationError = (error: Error, action: "create" | "update") => {
    toast.error(`Failed to ${action} team: ${error.message}`);
  };

  const createMutation = useMutation({
    mutationFn: (team: CreateTeamRequest) => {
      return teamQueries.createTeam(team);
    },
    onSuccess: () => handleMutationSuccess("created"),
    onError: (error) => handleMutationError(error, "create"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { teamId: string; team: UpdateTeamRequest }) => {
      return teamQueries.updateTeam(data.teamId, data.team);
    },
    onSuccess: () => handleMutationSuccess("updated"),
    onError: (error) => handleMutationError(error, "update"),
  });

  const deleteMutation = useMutation({
    mutationFn: (teamId: string) => {
      return teamQueries.deleteTeam(teamId);
    },
    onSuccess: () => {
      toast.success("Team deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setTeamToDelete(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete team: ${error.message}`);
      setTeamToDelete(null);
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem("team-view") as ViewMode;
    if ((saved && saved === "table") || saved === "grid") {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (newViewMode: ViewMode) => {
    setViewMode(newViewMode);
    localStorage.setItem("team-view", newViewMode);
  };
  const handleView = (team: Team) => {
    router.push(`/teams/${team.id}`);
  };

  const handleDelete = (team: Team) => {
    setTeamToDelete(team);
  };

  const handleEdit = (team: Team) => {
    setTeamToEdit(team);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setTeamToEdit(null);
    setIsFormOpen(true);
  };

  const handleSubmit = (data: CreateTeamRequest | UpdateTeamRequest) => {
    if (teamToEdit) {
      updateMutation.mutate({
        teamId: teamToEdit.id,
        team: data as UpdateTeamRequest,
      });
    } else {
      createMutation.mutate(data as CreateTeamRequest);
    }
  };

  const columnsWrapper = () => {
    return getColumns(handleView, handleEdit, handleDelete);
  };

  const renderTeamGrid = (
    team: Team,
    index: number,
    isSelected: boolean,
    onToggleSelect: () => void
  ) => {
    return (
      <GridItem<Team>
        key={team.id}
        item={team}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        onCardClick={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        fieldConfig={{
          id: "id",
          title: "name",
          description: "description",
          createdAt: "createdAt",
          badge: {
            field: "projectCount",
            label: "Projects:",
            variant: "secondary",
          },
          stats: [
            {
              field: "members",
              label: "member(s)",
              icon: Users,
              format: (value: unknown) =>
                Array.isArray(value) ? value.length : 0,
            },
          ],
        }}
        entityName="team"
      />
    );
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Teams</h1>
        <div className="flex items-center gap-4">
          <Button onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Team
          </Button>
          <ViewToggle
            view={viewmode}
            onViewChange={handleViewModeChange}
            className="shrink-0"
          />
        </div>
      </div>

      <div>
        {viewmode === "table" ? (
          <DataTable
            config={{
              enableUrlState: false,
              enableExport: true,
              enableDateFilter: false,
            }}
            exportConfig={{
              entityName: "teams",
              columnMapping: {},
              columnWidths: [],
              headers: [],
            }}
            getColumns={columnsWrapper}
            fetchDataFn={useTeamsForDataTable}
            idField="id"
            onRowClick={handleView}
          />
        ) : (
          <DataGrid
            config={{
              enableUrlState: false,
            }}
            exportConfig={{
              entityName: "teams",
              columnMapping: {},
              columnWidths: [],
              headers: [],
            }}
            getColumns={columnsWrapper}
            renderGridItem={renderTeamGrid}
            fetchDataFn={useTeamsForDataTable}
            idField="id"
            gridConfig={{
              columns: { default: 1, md: 2, lg: 3, xl: 4 },
              gap: 6,
            }}
            pageSizeOptions={[12, 24, 36, 48]}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
      <DeleteDialog
        isOpen={!!teamToDelete}
        onClose={() => setTeamToDelete(null)}
        onConfirm={() => teamToDelete && deleteMutation.mutate(teamToDelete.id)}
        title="Delete Team"
        description={`Are you sure you want to delete the team "${teamToDelete?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
      {isFormOpen && (
        <TeamForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setTeamToEdit(null);
          }}
          onSubmit={handleSubmit}
          team={teamToEdit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
