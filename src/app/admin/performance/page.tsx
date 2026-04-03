import fs from 'fs';
import path from 'path';
import PerformanceDashboard from '@/components/admin/PerformanceDashboard';
import { Activity } from 'lucide-react';

export const metadata = {
    title: "Tour de Contrôle - Performances | KitchenLuxe",
};

export default function PerformancePage() {
    // 1. Lire les données (On est côté serveur, donc on peut utiliser fs)
    const dataDir = path.join(process.cwd(), 'src/data');
    
    let postsData = [];
    let clicksData = {};
    let discoveredData = [];

    try {
        if (fs.existsSync(path.join(dataDir, 'posts.json'))) {
            postsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'posts.json'), 'utf8'));
        }
        if (fs.existsSync(path.join(dataDir, 'clicks.json'))) {
            clicksData = JSON.parse(fs.readFileSync(path.join(dataDir, 'clicks.json'), 'utf8'));
        }
        if (fs.existsSync(path.join(dataDir, 'discovered-products.json'))) {
            discoveredData = JSON.parse(fs.readFileSync(path.join(dataDir, 'discovered-products.json'), 'utf8'));
        }
    } catch (error) {
        console.error("Erreur lecture JSON:", error);
    }

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Activity className="h-8 w-8 text-blue-600" />
                    Tour de Contrôle & IA Auto-Optimisée
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Voici l'état des performances en temps réel de votre plateforme d'affiliation.
                    Ces statistiques sont utilisées par l'Agent Autopilot pour comprendre ce qui convertit et auto-optimiser les prochains articles.
                </p>
            </div>

            <PerformanceDashboard postsData={postsData} clicksData={clicksData} discoveredData={discoveredData} />
            
        </div>
    );
}
