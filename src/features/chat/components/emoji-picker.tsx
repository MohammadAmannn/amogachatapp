import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface EmojiItem {
  char: string
  name: string
}

interface EmojiCategory {
  name: string
  icon: string
  emojis: EmojiItem[]
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: 'Smileys & People',
    icon: '😊',
    emojis: [
      { char: '😊', name: 'smiley smile happy face pleased' },
      { char: '😂', name: 'joy laugh cry tear face lol' },
      { char: '🥰', name: 'love heart face warm smiley affectionate' },
      { char: '😍', name: 'heart eyes love admire beautiful' },
      { char: '😎', name: 'cool shades sunglasses smart style' },
      { char: '😏', name: 'smirk sly cheeky flirty' },
      { char: '😬', name: 'grimace nervous awkward tense' },
      { char: '😐', name: 'neutral blank expressionless poker face' },
      { char: '🙄', name: 'roll eyes sigh annoy bored' },
      { char: '😔', name: 'pensive sad sorrow regret regretful' },
      { char: '😢', name: 'cry sad tear upset hurt' },
      { char: '😭', name: 'sob cry tear dramatic heartbroken' },
      { char: '😡', name: 'angry mad rage face furious upset' },
      { char: '👍', name: 'thumbs up agree ok good like yes' },
      { char: '👎', name: 'thumbs down disagree bad dislike no' },
      { char: '👋', name: 'wave hello goodbye hi greetings' },
      { char: '👏', name: 'clap applaud praise congrats well done' },
      { char: '🙌', name: 'hands celebrate praise hooray high five' },
      { char: '🤝', name: 'handshake deal agree partner business' },
      { char: '🙏', name: 'pray hands please thank you hope' },
      { char: '❤️', name: 'heart red love passion emotion' },
      { char: '🔥', name: 'fire hot lit burn cool awesome' },
      { char: '✨', name: 'sparkles shine magic clean stars' },
      { char: '🌟', name: 'star gold shine bright success award' },
    ]
  },
  {
    name: 'Animals & Nature',
    icon: '🐶',
    emojis: [
      { char: '🐶', name: 'dog puppy pet animal canine' },
      { char: '🐱', name: 'cat kitten pet animal feline' },
      { char: '🦊', name: 'fox wild animal clever' },
      { char: '🦁', name: 'lion king wild animal pride' },
      { char: '🐯', name: 'tiger wild animal stripe' },
      { char: '🐼', name: 'panda animal cute bear' },
      { char: '🐵', name: 'monkey animal face chimp' },
      { char: '🐧', name: 'penguin bird antarctic animal wings' },
      { char: '🦅', name: 'eagle bird prey wild fly' },
      { char: '🌲', name: 'evergreen tree forest wood pine nature' },
      { char: '🌸', name: 'cherry blossom flower spring bloom pink' },
      { char: '🍁', name: 'maple leaf autumn fall tree orange' },
      { char: '🍀', name: 'four leaf clover luck green leaf' },
      { char: '🌍', name: 'earth globe world map europe africa planet' },
      { char: '☀️', name: 'sun hot sunny day summer light weather' },
      { char: '🌙', name: 'moon crescent night sleep space' },
      { char: '⛈️', name: 'thunderstorm rain storm cloud weather dark' },
      { char: '❄️', name: 'snowflake snow cold winter ice' },
    ]
  },
  {
    name: 'Food & Drink',
    icon: '🍎',
    emojis: [
      { char: '🍎', name: 'apple red fruit healthy eat' },
      { char: '🍌', name: 'banana yellow fruit peel' },
      { char: '🍉', name: 'watermelon fruit summer sweet' },
      { char: '🍇', name: 'grapes purple fruit wine' },
      { char: '🍓', name: 'strawberry red fruit berry sweet' },
      { char: '🍕', name: 'pizza cheese italian junk food slice meal' },
      { char: '🍔', name: 'hamburger burger beef cheese junk food meal' },
      { char: '🍟', name: 'french fries potato junk food snack' },
      { char: '🥗', name: 'green salad healthy vegetable diet' },
      { char: '☕', name: 'coffee tea hot mug cafe caffeine drink' },
      { char: '🍺', name: 'beer alcohol drink pub mug pint' },
      { char: '🥂', name: 'cheers champagne toast celebration wine alcohol' },
    ]
  },
  {
    name: 'Travel & Places',
    icon: '🚗',
    emojis: [
      { char: '🚗', name: 'car red auto travel vehicle drive' },
      { char: '✈️', name: 'airplane plane flight travel airport fly' },
      { char: '🚀', name: 'rocket space ship travel launch mission' },
      { char: '🚢', name: 'ship boat cruise travel water sea' },
      { char: '🚲', name: 'bicycle bike ride cycle sport transit' },
      { char: '🏔️', name: 'mountain snow peak travel nature climb' },
      { char: '🏖️', name: 'beach umbrella sand sun travel vacation summer' },
      { char: '⛺', name: 'tent camping travel outdoor shelter camp' },
      { char: '🏠', name: 'house home building live family' },
    ]
  },
  {
    name: 'Activities & Objects',
    icon: '⚽',
    emojis: [
      { char: '⚽', name: 'soccer football ball sport play game match' },
      { char: '🏀', name: 'basketball ball sport play game hoop' },
      { char: '🎮', name: 'controller video game play gaming console xbox playstation' },
      { char: '🎨', name: 'palette art paint draw creative design' },
      { char: '🎵', name: 'music note song sound audio musical' },
      { char: '📱', name: 'mobile phone cell smartphone tech device' },
      { char: '💻', name: 'laptop computer tech work screen notebook' },
      { char: '✉️', name: 'envelope letter mail message send post' },
      { char: '📝', name: 'memo notebook paper write edit pen note document' },
      { char: '🔑', name: 'key lock open security secret access' },
      { char: '📎', name: 'paperclip clip document attach office attachment' },
      { char: '🎁', name: 'gift present box birthday celebrate wrap surprise' },
      { char: '🏆', name: 'trophy prize award winner gold cup' },
    ]
  },
  {
    name: 'Symbols & Flags',
    icon: '🏁',
    emojis: [
      { char: '🏁', name: 'chequered flag race start finish checkered' },
      { char: '🏳️‍🌈', name: 'rainbow flag pride lgbt freedom love' },
      { char: '🇺🇸', name: 'united states america flag usa country american' },
      { char: '🇬🇧', name: 'united kingdom flag uk britain country british' },
      { char: '🇮🇳', name: 'india flag indian country national' },
      { char: '🇨🇦', name: 'canada flag canadian country' },
      { char: '🇯🇵', name: 'japan flag japanese country sun' },
    ]
  }
]

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void
}

export function EmojiPicker({ onSelectEmoji }: EmojiPickerProps) {
  const [search, setSearch] = useState('')
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)
  const gridContainerRef = useRef<HTMLDivElement>(null)

  // Memoize search results
  const filteredEmojis = useMemo(() => {
    if (!search.trim()) return null
    const query = search.toLowerCase().trim()
    const results: EmojiItem[] = []
    
    EMOJI_CATEGORIES.forEach(category => {
      category.emojis.forEach(emoji => {
        if (emoji.name.includes(query)) {
          results.push(emoji)
        }
      })
    })
    return results
  }, [search])

  // Reset focus inside grid when switching categories or searches
  useEffect(() => {
    if (gridContainerRef.current) {
      gridContainerRef.current.scrollTop = 0
    }
  }, [activeCategoryIndex, search])

  // Handle keyboard navigation inside the emoji grid
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, char: string, index: number, total: number) => {
    let targetIndex = -1
    const cols = 6 // grid-cols-6 on small screen, grid-cols-7 on lg

    switch (e.key) {
      case 'ArrowRight':
        targetIndex = index + 1
        break
      case 'ArrowLeft':
        targetIndex = index - 1
        break
      case 'ArrowDown':
        targetIndex = index + cols
        break
      case 'ArrowUp':
        targetIndex = index - cols
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        onSelectEmoji(char)
        break
      default:
        return
    }

    if (targetIndex >= 0 && targetIndex < total && gridContainerRef.current) {
      e.preventDefault()
      const buttons = gridContainerRef.current.querySelectorAll('button')
      const targetBtn = buttons[targetIndex] as HTMLButtonElement
      targetBtn?.focus()
    }
  }

  const currentCategory = EMOJI_CATEGORIES[activeCategoryIndex]

  return (
    <div className="flex flex-col h-72 w-64 sm:w-72 bg-popover text-popover-foreground rounded-lg overflow-hidden border border-border shadow-md">
      {/* Search Input */}
      <div className="p-2 border-b border-border flex items-center gap-1.5 shrink-0 bg-muted/20">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          type="text"
          placeholder="Search emoji..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 text-xs py-1 px-0"
          autoFocus
        />
      </div>

      {/* Category Icons Tabs (Only show if not searching) */}
      {!search && (
        <div className="flex items-center justify-between border-b border-border bg-muted/10 px-1 shrink-0">
          {EMOJI_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              type="button"
              title={cat.name}
              aria-label={cat.name}
              onClick={() => setActiveCategoryIndex(idx)}
              className={cn(
                "flex-1 py-2 text-center text-base hover:bg-muted/50 rounded-none transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0",
                activeCategoryIndex === idx ? "border-primary bg-muted/30" : "border-transparent"
              )}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid Container */}
      <div 
        ref={gridContainerRef}
        className="flex-1 p-2 overflow-y-auto"
      >
        {search ? (
          /* Search Results View */
          <div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground px-1 pb-1">
              Search Results
            </div>
            {filteredEmojis && filteredEmojis.length > 0 ? (
              <div className="grid grid-cols-6 sm:grid-cols-7 gap-1">
                {filteredEmojis.map((emoji, idx) => (
                  <button
                    key={`${emoji.char}-${idx}`}
                    type="button"
                    onClick={() => onSelectEmoji(emoji.char)}
                    onKeyDown={(e) => handleKeyDown(e, emoji.char, idx, filteredEmojis.length)}
                    aria-label={emoji.name}
                    className="h-8.5 w-8.5 text-xl flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {emoji.char}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs text-center text-muted-foreground py-10 font-medium">
                No emojis found
              </div>
            )}
          </div>
        ) : (
          /* Category List View */
          <div>
            <div className="text-[10px] uppercase font-bold text-muted-foreground px-1 pb-1.5 leading-none">
              {currentCategory.name}
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-7 gap-1">
              {currentCategory.emojis.map((emoji, idx) => (
                <button
                  key={`${emoji.char}-${idx}`}
                  type="button"
                  onClick={() => onSelectEmoji(emoji.char)}
                  onKeyDown={(e) => handleKeyDown(e, emoji.char, idx, currentCategory.emojis.length)}
                  aria-label={emoji.name}
                  className="h-8.5 w-8.5 text-xl flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {emoji.char}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default EmojiPicker
