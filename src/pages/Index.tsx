import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState([16]);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [strength, setStrength] = useState(0);
  const { toast } = useToast();

  const generatePassword = () => {
    let charset = '';
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) charset += '0123456789';
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      toast({
        title: 'Ошибка',
        description: 'Выберите хотя бы один тип символов',
        variant: 'destructive',
      });
      return;
    }

    let newPassword = '';
    const cryptoArray = new Uint32Array(length[0]);
    crypto.getRandomValues(cryptoArray);

    for (let i = 0; i < length[0]; i++) {
      newPassword += charset[cryptoArray[i] % charset.length];
    }

    setPassword(newPassword);
  };

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 12) score += 25;
    if (pass.length >= 16) score += 25;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score += 20;
    if (/\d/.test(pass)) score += 15;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 15;
    return Math.min(score, 100);
  };

  useEffect(() => {
    if (password) {
      setStrength(calculateStrength(password));
    }
  }, [password]);

  useEffect(() => {
    generatePassword();
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast({
        title: 'Скопировано!',
        description: 'Пароль скопирован в буфер обмена',
      });
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось скопировать пароль',
        variant: 'destructive',
      });
    }
  };

  const getStrengthColor = () => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (strength < 40) return 'Слабый';
    if (strength < 70) return 'Средний';
    return 'Надёжный';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg p-8 bg-card border-border shadow-2xl">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Icon name="Lock" size={32} className="text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">PassGan</h1>
            <p className="text-muted-foreground">Генератор надёжных паролей</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center gap-2 p-4 bg-secondary rounded-lg border border-border">
                <code className="flex-1 text-lg font-mono text-foreground break-all select-all">
                  {password || '••••••••••••••••'}
                </code>
                <Button
                  onClick={copyToClipboard}
                  size="icon"
                  variant="ghost"
                  className="shrink-0 hover:bg-primary/20 transition-colors"
                >
                  <Icon name="Copy" size={20} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Надёжность
                </span>
                <span className={`text-sm font-semibold ${
                  strength < 40 ? 'text-red-500' : strength < 70 ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {getStrengthLabel()}
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getStrengthColor()}`}
                  style={{ width: `${strength}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base">Длина: {length[0]}</Label>
              </div>
              <Slider
                value={length}
                onValueChange={setLength}
                min={8}
                max={64}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <Label htmlFor="uppercase" className="cursor-pointer">
                  Заглавные буквы (A-Z)
                </Label>
                <Switch
                  id="uppercase"
                  checked={uppercase}
                  onCheckedChange={setUppercase}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <Label htmlFor="lowercase" className="cursor-pointer">
                  Строчные буквы (a-z)
                </Label>
                <Switch
                  id="lowercase"
                  checked={lowercase}
                  onCheckedChange={setLowercase}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <Label htmlFor="numbers" className="cursor-pointer">
                  Цифры (0-9)
                </Label>
                <Switch
                  id="numbers"
                  checked={numbers}
                  onCheckedChange={setNumbers}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <Label htmlFor="symbols" className="cursor-pointer">
                  Символы (!@#$%^&*)
                </Label>
                <Switch
                  id="symbols"
                  checked={symbols}
                  onCheckedChange={setSymbols}
                />
              </div>
            </div>
          </div>

          <Button
            onClick={generatePassword}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all"
            size="lg"
          >
            <Icon name="RefreshCw" size={20} className="mr-2" />
            Сгенерировать пароль
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Index;
