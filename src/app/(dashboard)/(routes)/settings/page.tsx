'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Sun, Moon, Monitor, Globe, Lock, Play, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettingsStore } from '@/store/settings-store';
import { toast } from 'sonner';

// PIN form schema
const pinFormSchema = z.object({
  currentPin: z.string().min(4, 'PIN must be at least 4 characters'),
  newPin: z.string().min(4, 'PIN must be at least 4 characters'),
  confirmPin: z.string().min(4, 'PIN must be at least 4 characters'),
}).refine((data) => data.newPin === data.confirmPin, {
  message: "PINs don't match",
  path: ['confirmPin'],
});

type PinFormValues = z.infer<typeof pinFormSchema>;

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    parentalControlEnabled,
    setParentalControl,
    validatePin,
    setParentalControlPin,
    autoPlayNext,
    setAutoPlayNext,
    defaultSubtitleLanguage,
    setDefaultSubtitleLanguage,
    bufferSize,
    setBufferSize,
  } = useSettingsStore();
  
  const [showPinForm, setShowPinForm] = useState(false);
  
  // Initialize PIN form
  const pinForm = useForm<PinFormValues>({
    resolver: zodResolver(pinFormSchema),
    defaultValues: {
      currentPin: '',
      newPin: '',
      confirmPin: '',
    },
  });
  
  // Handle PIN form submission
  const onPinSubmit = (values: PinFormValues) => {
    if (!validatePin(values.currentPin)) {
      toast.error('Current PIN is incorrect');
      return;
    }
    
    setParentalControlPin(values.newPin);
    toast.success('PIN updated successfully');
    setShowPinForm(false);
    pinForm.reset();
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Customize your experience
        </p>
      </div>
      
      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Language</span>
          </TabsTrigger>
          <TabsTrigger value="parental" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Parental Control</span>
          </TabsTrigger>
          <TabsTrigger value="playback" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Playback</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="font-medium">Theme</div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    className="w-full sm:w-auto justify-start gap-2"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    className="w-full sm:w-auto justify-start gap-2"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    className="w-full sm:w-auto justify-start gap-2"
                    onClick={() => setTheme('system')}
                  >
                    <Monitor className="h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Language Settings */}
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>Language</CardTitle>
              <CardDescription>
                Set your preferred language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="font-medium">Interface Language</div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant={language === 'en' ? 'default' : 'outline'}
                    className="w-full sm:w-auto justify-start"
                    onClick={() => setLanguage('en')}
                  >
                    English
                  </Button>
                  <Button
                    variant={language === 'tr' ? 'default' : 'outline'}
                    className="w-full sm:w-auto justify-start"
                    onClick={() => setLanguage('tr')}
                  >
                    Türkçe
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Parental Control Settings */}
        <TabsContent value="parental">
          <Card>
            <CardHeader>
              <CardTitle>Parental Control</CardTitle>
              <CardDescription>
                Restrict access to adult content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Enable Parental Control</div>
                  <div className="text-sm text-muted-foreground">
                    Restrict access to adult content with a PIN
                  </div>
                </div>
                <Switch
                  checked={parentalControlEnabled}
                  onCheckedChange={setParentalControl}
                />
              </div>
              
              {parentalControlEnabled && (
                <div className="pt-4">
                  {!showPinForm ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowPinForm(true)}
                    >
                      Change PIN
                    </Button>
                  ) : (
                    <Form {...pinForm}>
                      <form onSubmit={pinForm.handleSubmit(onPinSubmit)} className="space-y-4">
                        <FormField
                          control={pinForm.control}
                          name="currentPin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current PIN</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={pinForm.control}
                          name="newPin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New PIN</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={pinForm.control}
                          name="confirmPin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New PIN</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex gap-2">
                          <Button type="submit">Update PIN</Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowPinForm(false);
                              pinForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Playback Settings */}
        <TabsContent value="playback">
          <Card>
            <CardHeader>
              <CardTitle>Playback</CardTitle>
              <CardDescription>
                Configure video playback settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Auto Play Next Episode</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically play the next episode when the current one ends
                  </div>
                </div>
                <Switch
                  checked={autoPlayNext}
                  onCheckedChange={setAutoPlayNext}
                />
              </div>
              
              <div className="space-y-4">
                <div className="font-medium">Buffer Size (seconds)</div>
                <div className="flex flex-col space-y-2">
                  <Slider
                    value={[bufferSize]}
                    min={5}
                    max={60}
                    step={5}
                    onValueChange={(value) => setBufferSize(value[0])}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>5s</span>
                    <span>{bufferSize}s</span>
                    <span>60s</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Larger buffer helps with playback stability but uses more memory
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium">Default Subtitle Language</div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={defaultSubtitleLanguage === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDefaultSubtitleLanguage(null)}
                  >
                    None
                  </Button>
                  <Button
                    variant={defaultSubtitleLanguage === 'en' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDefaultSubtitleLanguage('en')}
                  >
                    English
                  </Button>
                  <Button
                    variant={defaultSubtitleLanguage === 'tr' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDefaultSubtitleLanguage('tr')}
                  >
                    Turkish
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}