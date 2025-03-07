import fs from 'fs';
import path from 'path';
import DataDuringCooldown from './json/nfnode-during-cooldown.json';
import DataPreviousCooldown from './json/nfnode-previous-cooldown.json';

export const generateSummaries = () => {
  // Generar resumen para During Cooldown
  const duringSummary = Object.entries(
    DataDuringCooldown.reduce((acc, node) => {
      const userId = node.user_id;
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([user_id, node_count]) => ({
    user_id: Number(user_id),
    node_count
  }));

  // Generar resumen para Previous Cooldown
  const previousSummary = Object.entries(
    DataPreviousCooldown.reduce((acc, node) => {
      const userId = node.user_id;
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([user_id, node_count]) => ({
    user_id: Number(user_id),
    node_count
  }));

  // Guardar archivos
  const summaryPath = path.join(__dirname, '../data');
  
  fs.writeFileSync(
    path.join(summaryPath, 'during-cooldown-summary.json'),
    JSON.stringify(duringSummary, null, 2)
  );

  fs.writeFileSync(
    path.join(summaryPath, 'previous-cooldown-summary.json'),
    JSON.stringify(previousSummary, null, 2)
  );

  console.log('During Cooldown Summary:', duringSummary);
  console.log('Previous Cooldown Summary:', previousSummary);
  console.log('Summary files generated successfully!');
};