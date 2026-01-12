import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls, Grid } from '@react-three/drei';
import { Suspense, useMemo } from 'react';

export type FloorArea = {
  id: string;
  label: string;
  position: [number, number]; // x, z on the floor plane
  size: [number, number]; // width, depth
  color?: string;
};

export type FloorConfig = {
  id: string;
  name: string;
  elevation: number; // meters up (y axis)
  color?: string;
  accent?: string;
  areas?: FloorArea[];
  size?: [number, number]; // plane width/depth in scene units
  employees?: EmployeeMarker[];
};

type FloorViewerProps = {
  floors: FloorConfig[];
  activeFloorId: string;
  onEmployeeSelect?: (id: string) => void;
  activeEmployeeId?: string | null;
};

type EmployeeMarker = {
  id: string;
  position: [number, number];
  label?: string;
  color?: string;
};

function EmployeeMarkers({ employees, activeId, onSelect }: { employees: EmployeeMarker[]; activeId?: string | null; onSelect?: (id: string) => void }) {
  return (
    <group>
      {employees.map((emp) => {
        const isActive = activeId === emp.id;
        return (
          <group key={emp.id} position={[emp.position[0], 0.5, emp.position[1]]}>
            <mesh
              castShadow
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(emp.id);
              }}
            >
              <sphereGeometry args={[isActive ? 0.28 : 0.22, 24, 16]} />
              <meshStandardMaterial color={emp.color ?? (isActive ? '#f97316' : '#0ea5e9')} emissiveIntensity={0.4} />
            </mesh>
            <Html distanceFactor={20} position={[0, 0.6, 0]} center>
              <div className="rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-700 shadow">
                {emp.label ?? emp.id}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function FloorMesh({ floor, activeEmployeeId, onEmployeeSelect }: { floor: FloorConfig; activeEmployeeId?: string | null; onEmployeeSelect?: (id: string) => void }) {
  const baseColor = floor.color ?? '#dbeafe';
  const accentColor = floor.accent ?? '#1d4ed8';
  const width = floor.size?.[0] ?? 20;
  const depth = floor.size?.[1] ?? 14;

  return (
    <group position={[0, floor.elevation, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={baseColor} />
      </mesh>

      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color={accentColor} opacity={0.15} transparent />
      </mesh>

      {floor.areas?.map((area) => (
        <mesh
          key={area.id}
          position={[area.position[0], 0.12, area.position[1]]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[area.size[0], 0.24, area.size[1]]} />
          <meshStandardMaterial color={area.color ?? '#bfdbfe'} />
          <Html distanceFactor={18} position={[0, 0.8, 0]} center style={{ pointerEvents: 'none' }}>
            <div className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-slate-700 shadow">
              {area.label}
            </div>
          </Html>
        </mesh>
      ))}

      <Html distanceFactor={22} position={[0, 1.4, 0]} center>
        <div className="rounded bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white shadow">
          {floor.name}
        </div>
      </Html>

      {floor.employees && floor.employees.length > 0 ? (
        <EmployeeMarkers employees={floor.employees} activeId={activeEmployeeId} onSelect={onEmployeeSelect} />
      ) : null}
    </group>
  );
}

export function FloorViewer({ floors, activeFloorId, onEmployeeSelect, activeEmployeeId }: FloorViewerProps) {
  const activeFloor = useMemo(() => floors.find((f) => f.id === activeFloorId) ?? floors[0], [floors, activeFloorId]);

  if (!activeFloor) {
    return <div className="flex h-full items-center justify-center text-sm text-slate-600">No floors to display</div>;
  }

  return (
    <div className="h-full rounded-lg border border-slate-200 bg-white shadow-sm">
      <Canvas shadows camera={{ position: [14, 10, 14], fov: 40 }} style={{ height: '100%', width: '100%' }}>
        <color attach="background" args={[0.96, 0.98, 1]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[8, 12, 6]} intensity={0.9} castShadow shadow-mapSize={[1024, 1024]} />
        <Suspense fallback={null}>
          <group position={[0, 0, 0]}>
            <Grid
              args={[30, 30]}
              position={[0, -0.01, 0]}
              sectionColor="#e2e8f0"
              cellColor="#cbd5e1"
              infiniteGrid
            />
            <FloorMesh floor={activeFloor} activeEmployeeId={activeEmployeeId} onEmployeeSelect={onEmployeeSelect} />
          </group>
        </Suspense>
        <OrbitControls enablePan enableZoom enableRotate target={[0, activeFloor.elevation, 0]} />
      </Canvas>
    </div>
  );
}
