import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "../auth-check";
import { DataSourceService } from "@/services/data-pipeline/data-source.service";
import { PipelineOrchestratorService } from "@/services/data-pipeline/pipeline-orchestrator.service";
import { RawStorageService } from "@/services/data-pipeline/raw-storage.service";

export async function GET(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.authorized) return auth.response!;

  try {
    const [sources, logs, failedRecords] = await Promise.all([
      DataSourceService.getDataSources(),
      PipelineOrchestratorService.getPipelineLogs(),
      RawStorageService.getFailedRecords(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        sources,
        logs,
        failedRecords,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve pipeline data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = checkAdminAuth(request);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await request.json();
    const { sourceId, records } = body;

    if (!sourceId) {
      return NextResponse.json(
        { success: false, error: "sourceId is required." },
        { status: 400 }
      );
    }

    // Run pipeline ingestion
    const log = await PipelineOrchestratorService.runIngestionPipeline(
      sourceId,
      Array.isArray(records) ? records : []
    );

    return NextResponse.json({
      success: true,
      data: log,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Pipeline execution failed" },
      { status: 500 }
    );
  }
}
