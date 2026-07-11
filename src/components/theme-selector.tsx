import { Check, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  colorThemes,
  useColorTheme,
} from '@/context/color-theme-provider'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

export function ThemeSelector() {
  const { colorTheme, setColorTheme } = useColorTheme()
  const { theme, setTheme } = useTheme()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative size-8 shrink-0 scale-95 rounded-full'
          aria-label='Select color theme'
        >
          <Palette className='size-[1.2rem]' />
          {/* Active color indicator dot */}
          <span
            className='absolute -top-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-background'
            style={{
              backgroundColor:
                colorThemes.find((t) => t.name === colorTheme)?.preview ??
                'currentColor',
            }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-[280px] p-3'
      >
        {/* Appearance Section */}
        <div className='mb-1'>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Appearance
          </p>
          <div className='grid grid-cols-3 gap-1.5'>
            {(
              [
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' },
              ] as const
            ).map((mode) => (
              <button
                key={mode.value}
                onClick={() => setTheme(mode.value)}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                  'hover:bg-accent hover:text-accent-foreground',
                  theme === mode.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-muted-foreground'
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <Separator className='my-3' />

        {/* Color Theme Section */}
        <div>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            Color Theme
          </p>
          <div className='max-h-[280px] space-y-0.5 overflow-y-auto'>
            {colorThemes.map((ct) => (
              <button
                key={ct.name}
                onClick={() => setColorTheme(ct.name)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 transition-all',
                  colorTheme === ct.name
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                )}
                aria-label={`Select ${ct.label} color theme`}
              >
                <div className='flex gap-0.5'>
                  {ct.colors.slice(0, 5).map((color, i) => (
                    <span
                      key={i}
                      className={cn(
                        'size-2.5 rounded-full',
                        colorTheme === ct.name
                          ? 'ring-1 ring-primary-foreground/30'
                          : 'ring-1 ring-border/40'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className='text-xs font-medium'>{ct.label}</span>
                {colorTheme === ct.name && (
                  <Check className='ml-auto size-3.5' strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
