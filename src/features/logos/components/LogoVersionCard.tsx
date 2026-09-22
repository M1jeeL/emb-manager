import { useState } from "react";

import type { LogoVersion } from "../../../types";

import { LogoFileCard } from "./LogoFileCard";
import { UploadLogoFileDialog } from "./UploadLogoFileDialog";
import { Button } from "../../../components/ui";

interface LogoVersionCardProps {
  logoId: string;
  version: LogoVersion;
}

export function LogoVersionCard({ logoId, version }: LogoVersionCardProps) {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
      <section className="rounded-xl border bg-white">
        <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                Versión {version.version}
              </h3>

              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                {version.files.length}{" "}
                {version.files.length === 1 ? "archivo" : "archivos"}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              {version.widthMm !== null && version.heightMm !== null && (
                <span>
                  {version.widthMm} × {version.heightMm} mm
                </span>
              )}

              {version.stitchCount !== null && (
                <span>
                  {version.stitchCount.toLocaleString("es-CL")} puntadas
                </span>
              )}
            </div>

            {version.notes && (
              <p className="mt-2 text-sm text-gray-600">{version.notes}</p>
            )}
          </div>

          <Button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="rounded-lg px-4 py-2 text-sm text-white"
          >
            + Subir archivo
          </Button>
        </div>

        <div className="space-y-2 p-5">
          {version.files.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-sm text-gray-500">
                Esta versión todavía no tiene archivos.
              </p>

              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="mt-3 text-sm font-medium underline"
              >
                Subir primer archivo
              </button>
            </div>
          ) : (
            version.files.map((file) => (
              <LogoFileCard
                key={file.id}
                logoId={logoId}
                versionId={version.id}
                file={file}
              />
            ))
          )}
        </div>
      </section>

      <UploadLogoFileDialog
        logoId={logoId}
        versionId={version.id}
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
      />
    </>
  );
}
