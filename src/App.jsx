import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import SelfLoopEdge from './customs/SelfLoopEdge';
import { useQuery, gql } from '@apollo/client';
import 'reactflow/dist/style.css';

const GET_PERMISSIONS_QUERY = gql`
  query GetPermissions {
    permissions(where: { dao: "0x000fccb5818c2e36fb5de590957c06db9f63b2f7" }) {
      permissionId
      where
      who
    }
  }
`;

const edgeTypes = {
  custom: SelfLoopEdge
};

function processPermissionsData(permissions, daoId) {
  const uniqueAddresses = new Set();
  const nodes = [];
  const edges = [];

  permissions.forEach((permission, index) => {
    // Shorten permissionId and addresses
    const shortenedPermissionId = `0x${permission.permissionId.slice(2, 8)}`;
    const shortenedWhere = `0x${permission.where.slice(2, 6)}`;
    const shortenedWho = `0x${permission.who.slice(2, 6)}`;

    // Add nodes for unique addresses in 'where' and 'who'
    [shortenedWhere, shortenedWho].forEach(address => {
      if (!uniqueAddresses.has(address)) {
        uniqueAddresses.add(address);
        let label = address;
        if (address === `0x${daoId.slice(2, 6)}`) {
          label = `DAO: ${address}`;
        }
        nodes.push({
          id: address,
          data: { label: label },
          position: { x: Math.random() * 500, y: Math.random() * 500 } // Random position
        });
      }
    });

    // Add an edge for each permission from 'where' to 'who'
    const edgeType = shortenedWhere === shortenedWho ? 'custom' : 'default';
    edges.push({
      id: `edge-${shortenedPermissionId}`,
      source: shortenedWhere,
      target: shortenedWho,
      animated: true,
      label: `Perm ID: ${shortenedPermissionId}`,
      type: edgeType,
      data: {index}
    });
  });

  return { nodes, edges };
}

export default function App() {
  const { loading, error, data } = useQuery(GET_PERMISSIONS_QUERY);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  useEffect(() => {
    if (data && data.permissions) {
      const daoId = "0x000fccb5818c2e36fb5de590957c06db9f63b2f7"; // Full DAO ID
      const { nodes, edges } = processPermissionsData(data.permissions, daoId);
      setNodes(nodes);
      setEdges(edges);
    }
  }, [data, setNodes, setEdges]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
