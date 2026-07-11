'use client'

import { type SVGProps, useState } from 'react'
import { Root as Radio, Item } from '@radix-ui/react-radio-group'
import { Check, CircleCheck, RotateCcw, Search, Settings } from 'lucide-react'
import { IconThemeDark } from '@/assets/custom/icon-theme-dark'
import { IconThemeLight } from '@/assets/custom/icon-theme-light'
import { IconThemeSystem } from '@/assets/custom/icon-theme-system'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'
import {
  colorThemes,
  DEFAULT_COLOR_THEME,
  useColorTheme,
} from '@/context/color-theme-provider'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

// ✅ ADDED: Allow custom trigger
type ConfigDrawerProps = {
  trigger?: React.ReactNode
}

export function ConfigDrawer({
  trigger,
}: ConfigDrawerProps) {
  const { resetTheme } = useTheme()
  const { resetColorTheme } = useColorTheme()

  const handleReset = () => {
    resetTheme()
    resetColorTheme()
  }

  return (
    <Sheet>
      {/* ==========================================
          UPDATED
          Use custom trigger if provided
          Otherwise show default settings button
      ========================================== */}
      <SheetTrigger asChild>
        {trigger ?? (
          <Button
            size='icon'
            variant='ghost'
            aria-label='Open theme settings'
            className='rounded-full'
          >
            <Settings aria-hidden='true' />
          </Button>
        )}
      </SheetTrigger>

      {/* ==========================================
          EXISTING DRAWER CONTENT
      ========================================== */}
      <SheetContent className='flex flex-col'>
        <SheetHeader className='pb-0 text-start'>
          <SheetTitle>Theme Settings</SheetTitle>
          <SheetDescription>
            Customize the look and feel of your dashboard.
          </SheetDescription>
        </SheetHeader>

        <div className='flex flex-1 flex-col gap-6 overflow-hidden px-4'>
          <ThemeConfig />
          <ThemeListSelector />
        </div>

        <SheetFooter className='gap-2'>
          <Button
            variant='destructive'
            onClick={handleReset}
          >
            Reset
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function SectionTitle({
  title,
  showReset = false,
  onReset,
  resetAriaLabel,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  /** Shown on the small per-section reset (RotateCcw) for accessibility and tests. */
  resetAriaLabel?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground',
        className
      )}
    >
      {title}
      {showReset && onReset && (
        <Button
          type='button'
          size='icon'
          variant='secondary'
          className='size-4 rounded-full'
          onClick={onReset}
          aria-label={resetAriaLabel}
        >
          <RotateCcw className='size-3' />
        </Button>
      )}
    </div>
  )
}

function RadioGroupItem({
  item,
  isTheme = false,
}: {
  item: {
    value: string
    label: string
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  }
  isTheme?: boolean
}) {
  return (
    <Item
      value={item.value}
      className={cn('group outline-none', 'transition duration-200 ease-in')}
      aria-label={`Select ${item.label.toLowerCase()}`}
      aria-describedby={`${item.value}-description`}
    >
      <div
        className={cn(
          'relative rounded-[6px] ring-[1px] ring-border',
          'group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary',
          'group-focus-visible:ring-2'
        )}
        role='img'
        aria-hidden='false'
        aria-label={`${item.label} option preview`}
      >
        <CircleCheck
          className={cn(
            'size-6 fill-primary stroke-white',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2'
          )}
          aria-hidden='true'
        />
        <item.icon
          className={cn(
            !isTheme &&
              'fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground'
          )}
          aria-hidden='true'
        />
      </div>
      <div
        className='mt-1 text-xs'
        id={`${item.value}-description`}
        aria-live='polite'
      >
        {item.label}
      </div>
    </Item>
  )
}

function ThemeConfig() {
  const { defaultTheme, theme, setTheme } = useTheme()
  return (
    <div>
      <SectionTitle
        title='Theme'
        showReset={theme !== defaultTheme}
        onReset={() => setTheme(defaultTheme)}
        resetAriaLabel='Reset theme preference to default'
      />
      <Radio
        value={theme}
        onValueChange={setTheme}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label='Select theme preference'
        aria-describedby='theme-description'
      >
        {[
          {
            value: 'system',
            label: 'System',
            icon: IconThemeSystem,
          },
          {
            value: 'light',
            label: 'Light',
            icon: IconThemeLight,
          },
          {
            value: 'dark',
            label: 'Dark',
            icon: IconThemeDark,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} isTheme />
        ))}
      </Radio>
      <div id='theme-description' className='sr-only'>
        Choose between system preference, light mode, or dark mode
      </div>
    </div>
  )
}

function ThemeListSelector() {
  const [search, setSearch] = useState('')
  const { colorTheme, setColorTheme } = useColorTheme()

  const filtered = colorThemes.filter((t) =>
    t.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <SectionTitle
        title='Color Theme'
        showReset={colorTheme !== DEFAULT_COLOR_THEME}
        onReset={() => setColorTheme(DEFAULT_COLOR_THEME)}
        resetAriaLabel='Reset color theme to default'
      />

      {/* Search input */}
      <div className='relative mb-3'>
        <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
        <input
          type='text'
          placeholder='Search themes...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            'w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            'transition-colors'
          )}
        />
      </div>

      {/* Theme count */}
      <p className='mb-2 text-xs text-muted-foreground'>
        {filtered.length} theme{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Scrollable theme list */}
      <div
        className='flex-1 space-y-0.5 overflow-y-auto rounded-lg pr-1'
        role='radiogroup'
        aria-label='Select color theme'
      >
        {filtered.length === 0 && (
          <p className='py-8 text-center text-sm text-muted-foreground'>
            No themes found
          </p>
        )}
        {filtered.map((ct) => (
          <button
            key={ct.name}
            onClick={() => setColorTheme(ct.name)}
            role='radio'
            aria-checked={colorTheme === ct.name}
            aria-label={`Select ${ct.label} theme`}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150',
              colorTheme === ct.name
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'hover:bg-accent'
            )}
          >
            {/* Color preview dots */}
            <div className='flex gap-1'>
              {ct.colors.map((color, i) => (
                <span
                  key={i}
                  className={cn(
                    'size-3.5 rounded-full shadow-sm',
                    colorTheme === ct.name
                      ? 'ring-1 ring-primary-foreground/30'
                      : 'ring-1 ring-border/50'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Theme name */}
            <span className='text-sm font-medium'>{ct.label}</span>

            {/* Selected indicator */}
            {colorTheme === ct.name && (
              <Check className='ml-auto size-4 shrink-0' strokeWidth={3} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
