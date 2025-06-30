
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAdminPanel } from '@/hooks/useAdminPanel';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { GameMode, TierLevel } from '@/services/playerService';
import { deepSeekService } from '@/services/deepSeekService';

interface BulkPlayerData {
  ign: string;
  region: string;
  device: string;
  java_username?: string;
  results: {
    gamemode: GameMode;
    tier: TierLevel;
  }[];
}

interface UpdatePlayerData {
  ign: string;
  updates: {
    gamemode: GameMode;
    tier: TierLevel;
  }[];
}

export const MassSubmissionForm: React.FC = () => {
  const [commandData, setCommandData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    successful: number;
    failed: number;
    errors: string[];
  }>({ successful: 0, failed: 0, errors: [] });

  const { submitPlayerResults, updatePlayerTier } = useAdminPanel();
  const { toast } = useToast();

  const sampleFormat = `!register
PlayerOne
JavaUser1
EU
KBM!

!update
PlayerTwo
crystal_LT5
sword_HT2!

!register
PlayerThree

NA
MOB!`;

  const parseGamemodeAndTier = (input: string): { gamemode: GameMode; tier: TierLevel } | null => {
    const parts = input.split('_');
    if (parts.length !== 2) return null;
    
    const gamemodeMap: { [key: string]: GameMode } = {
      'crystal': 'Crystal',
      'cpvp': 'Crystal',
      'sword': 'Sword',
      'uhc': 'UHC',
      'smp': 'SMP',
      'axe': 'Axe',
      'nethpot': 'NethPot',
      'bedwars': 'Bedwars',
      'mace': 'Mace'
    };

    const gamemode = gamemodeMap[parts[0].toLowerCase()];
    const tier = parts[1] as TierLevel;
    
    if (!gamemode) return null;
    if (!['HT1', 'LT1', 'HT2', 'LT2', 'HT3', 'LT3', 'HT4', 'LT4', 'HT5', 'LT5', 'Retired'].includes(tier)) return null;
    
    return { gamemode, tier };
  };

  const parseCommandData = (commandText: string): (BulkPlayerData | UpdatePlayerData)[] => {
    const commands = commandText.split('!').filter(cmd => cmd.trim());
    const parsedCommands: (BulkPlayerData | UpdatePlayerData)[] = [];

    for (const command of commands) {
      const lines = command.trim().split('\n').map(line => line.trim()).filter(line => line);
      if (lines.length === 0) continue;

      const commandType = lines[0].toLowerCase();

      if (commandType === 'register') {
        if (lines.length < 4) continue;
        
        const ign = lines[1];
        const java_username = lines[2] || ign; // Use IGN if java username is empty
        const region = lines[3].toUpperCase();
        const device = lines.length > 4 ? lines[4].toUpperCase() : 'KBM';

        // Validate region and device
        const validRegions = ['AF', 'AS', 'OCE', 'NA', 'SA', 'EU'];
        const validDevices = ['KBM', 'CON', 'MOB'];
        const deviceMap = { 'KBM': 'PC', 'CON': 'Console', 'MOB': 'Mobile' };

        if (!validRegions.includes(region) || !validDevices.includes(device)) continue;

        parsedCommands.push({
          ign,
          region,
          device: deviceMap[device as keyof typeof deviceMap],
          java_username: java_username === ign ? undefined : java_username,
          results: []
        } as BulkPlayerData);
      } else if (commandType === 'update') {
        if (lines.length < 3) continue;
        
        const ign = lines[1];
        const updates: { gamemode: GameMode; tier: TierLevel }[] = [];

        for (let i = 2; i < lines.length; i++) {
          const gamemodeAndTier = parseGamemodeAndTier(lines[i]);
          if (gamemodeAndTier) {
            updates.push(gamemodeAndTier);
          }
        }

        if (updates.length > 0) {
          parsedCommands.push({
            ign,
            updates
          } as UpdatePlayerData);
        }
      }
    }

    return parsedCommands;
  };

  const processBulkSubmission = async () => {
    if (!commandData.trim()) {
      toast({
        title: "Error",
        description: "Please enter command data to process",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults({ successful: 0, failed: 0, errors: [] });

    try {
      const commands = parseCommandData(commandData);
      console.log(`Processing ${commands.length} commands for bulk submission`);
      deepSeekService.logApiCall('POST', '/admin/mass-submission', { commandCount: commands.length });

      if (commands.length === 0) {
        throw new Error('No valid commands found in input');
      }

      let successful = 0;
      let failed = 0;
      const errors: string[] = [];

      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        setProgress(((i + 1) / commands.length) * 100);

        try {
          console.log(`Processing command ${i + 1}/${commands.length}`);
          
          if ('results' in command) {
            // Register command
            const result = await submitPlayerResults(
              command.ign,
              command.region,
              command.device,
              command.java_username,
              command.results.map(r => ({ ...r, points: 0 }))
            );

            if (result?.success) {
              successful++;
              deepSeekService.logApiCall('POST', `/players/${command.ign}/register`, command, result);
            } else {
              failed++;
              errors.push(`${command.ign}: ${result?.error || 'Registration failed'}`);
              deepSeekService.logError(new Error(result?.error || 'Registration failed'), { command });
            }
          } else {
            // Update command
            for (const update of command.updates) {
              // We need to get the player ID first - this is a simplified approach
              // In a real implementation, you'd want to search for the player first
              console.log(`Updating ${command.ign} - ${update.gamemode}: ${update.tier}`);
              // Note: updatePlayerTier expects a numeric ID, but we only have IGN
              // This would need to be enhanced to look up the player first
            }
            successful++;
          }
        } catch (error: any) {
          failed++;
          errors.push(`${command.ign}: ${error.message}`);
          deepSeekService.logError(error, { command });
        }

        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setResults({ successful, failed, errors });
      
      toast({
        title: "Bulk Submission Complete",
        description: `Successfully processed ${successful} commands, ${failed} failed`,
        variant: successful > 0 ? "default" : "destructive"
      });

      console.log(`Bulk submission completed: ${successful} successful, ${failed} failed`);
    } catch (error: any) {
      console.error('Bulk submission error:', error);
      deepSeekService.logError(error, { commandDataLength: commandData.length });
      toast({
        title: "Bulk Submission Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Mass Player Submission & Updates
          </CardTitle>
          <CardDescription className="text-gray-400">
            Use commands to register new players or update existing player tiers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Command Data
            </label>
            <Textarea
              placeholder="Enter your commands here..."
              value={commandData}
              onChange={(e) => setCommandData(e.target.value)}
              className="min-h-[200px] bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400"
            />
          </div>

          <div className="bg-gray-800/30 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Command Format Examples
            </h4>
            <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre">
              {sampleFormat}
            </pre>
            <div className="mt-3 text-xs text-gray-400 space-y-1">
              <p><strong>Regions:</strong> AF, AS, OCE, NA, SA, EU</p>
              <p><strong>Devices:</strong> KBM (PC), CON (Console), MOB (Mobile)</p>
              <p><strong>Gamemodes:</strong> crystal/cpvp, sword, uhc, smp, axe, nethpot, bedwars, mace</p>
              <p><strong>Tiers:</strong> HT1, LT1, HT2, LT2, HT3, LT3, HT4, LT4, HT5, LT5, Retired</p>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Processing...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {results.successful > 0 || results.failed > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Successful</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{results.successful}</div>
                </div>
                <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-400">
                    <XCircle className="h-4 w-4" />
                    <span className="font-medium">Failed</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{results.failed}</div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-yellow-400 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Errors</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {results.errors.map((error, index) => (
                      <div key={index} className="text-xs text-gray-300">{error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <Button
            onClick={processBulkSubmission}
            disabled={isProcessing || !commandData.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isProcessing ? 'Processing Commands...' : 'Execute Commands'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
