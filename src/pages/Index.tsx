import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const [history, setHistory] = useState<string[]>([]);
  const [checkPassword, setCheckPassword] = useState('');
  const [breachCount, setBreachCount] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
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
    setHistory((prev) => [newPassword, ...prev.slice(0, 9)]);
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

  const checkPasswordBreach = async () => {
    if (!checkPassword) {
      toast({
        title: 'Ошибка',
        description: 'Введите пароль для проверки',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);
    setBreachCount(null);

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(checkPassword);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();

      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const text = await response.text();

      const hashes = text.split('\n');
      const found = hashes.find((line) => line.startsWith(suffix));

      if (found) {
        const count = parseInt(found.split(':')[1]);
        setBreachCount(count);
        toast({
          title: '⚠️ Пароль скомпрометирован!',
          description: `Найден в ${count.toLocaleString('ru-RU')} утечках`,
          variant: 'destructive',
        });
      } else {
        setBreachCount(0);
        toast({
          title: '✓ Пароль безопасен',
          description: 'Не найден в базах утечек',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось проверить пароль',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const copyHistoryPassword = async (pass: string) => {
    try {
      await navigator.clipboard.writeText(pass);
      toast({
        title: 'Скопировано!',
        description: 'Пароль скопирован из истории',
      });
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось скопировать',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-4xl grid gap-6 md:grid-cols-2">
        <Card className="p-8 bg-card border-border shadow-2xl">
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

      <div className="space-y-6">
        <Card className="p-6 bg-card border-border shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
                <Icon name="ShieldAlert" size={20} className="text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Проверка утечек</h2>
                <p className="text-sm text-muted-foreground">Проверьте пароль в базах утечек</p>
              </div>
            </div>

            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Введите пароль для проверки"
                value={checkPassword}
                onChange={(e) => setCheckPassword(e.target.value)}
                className="h-12 bg-secondary border-border"
                onKeyDown={(e) => e.key === 'Enter' && checkPasswordBreach()}
              />
              <Button
                onClick={checkPasswordBreach}
                disabled={isChecking}
                className="w-full h-11 bg-destructive hover:bg-destructive/90"
              >
                {isChecking ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  <>
                    <Icon name="Search" size={18} className="mr-2" />
                    Проверить пароль
                  </>
                )}
              </Button>

              {breachCount !== null && (
                <Alert className={breachCount > 0 ? 'bg-destructive/10 border-destructive' : 'bg-green-500/10 border-green-500'}>
                  <Icon name={breachCount > 0 ? 'AlertTriangle' : 'CheckCircle'} size={18} />
                  <AlertDescription className={breachCount > 0 ? 'text-destructive' : 'text-green-500'}>
                    {breachCount > 0
                      ? `Пароль найден в ${breachCount.toLocaleString('ru-RU')} утечках`
                      : 'Пароль не найден в базах утечек'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border shadow-2xl">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Icon name="History" size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">История паролей</h2>
                <p className="text-sm text-muted-foreground">Последние 10 паролей</p>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="Clock" size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">История пуста</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.map((pass, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-secondary rounded-lg border border-border hover:bg-secondary/80 transition-colors group"
                  >
                    <code className="flex-1 text-sm font-mono text-foreground truncate">
                      {pass}
                    </code>
                    <Button
                      onClick={() => copyHistoryPassword(pass)}
                      size="icon"
                      variant="ghost"
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon name="Copy" size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
    </div>
  );
};

export default Index;