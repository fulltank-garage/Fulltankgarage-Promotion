import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import fulltankGarageLogo from './assets/fulltank-garage-logo.jpg'
import { getJson } from './lib/api'

type Promotion = {
  title: string
  description: string
  imageUrl?: string
  validUntil: string
  gradient: string
  imageText: string
}

const promotions: Promotion[] = [
  {
    title: 'ติดฟิล์มรอบคัน ราคาพิเศษ',
    description: 'เลือกรุ่นฟิล์มยอดนิยมพร้อมรับส่วนลดค่าแรงติดตั้งสำหรับรถเก๋งและ SUV',
    validUntil: '31 พ.ค. 2569',
    gradient: 'from-[#ff342f] via-[#6f0908] to-[#121212]',
    imageText: 'FULL SET',
  },
  {
    title: 'อัปเกรดบานหน้า Clear Vision',
    description: 'เพิ่มความสบายตาด้วยฟิล์มใสกันร้อนสำหรับลูกค้าที่ติดตั้งรอบคัน',
    validUntil: '15 มิ.ย. 2569',
    gradient: 'from-[#ff4a45] via-[#243247] to-[#101010]',
    imageText: 'FRONT',
  },
  {
    title: 'ลูกค้าเก่าแนะนำเพื่อน',
    description: 'รับสิทธิ์ส่วนลดบริการดูแลฟิล์ม เมื่อเพื่อนลงทะเบียนรับประกันสำเร็จ',
    validUntil: '30 มิ.ย. 2569',
    gradient: 'from-[#ff2f2b] via-[#3b0404] to-[#070707]',
    imageText: 'REFER',
  },
]

function App() {
  const [items, setItems] = useState<Promotion[]>([])
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)

  useEffect(() => {
    let isMounted = true

    getJson<
      {
        title: string
        description?: string
        imageUrl?: string
        endsAt?: string
      }[]
    >('/public/promotions?public=true')
      .then((promotionsFromApi) => {
        if (!isMounted) {
          return
        }

        setItems(
          promotionsFromApi.length > 0
            ? promotionsFromApi.map((promotion, index) => ({
                title: promotion.title,
                description: promotion.description || 'โปรโมชันจาก FullTank Garage',
                imageUrl: promotion.imageUrl,
                validUntil: formatThaiDate(promotion.endsAt) || 'สอบถามหน้าร้าน',
                gradient: promotions[index % promotions.length].gradient,
                imageText: promotion.title.split(/\s+/).slice(0, 2).join(' ').toUpperCase(),
              }))
            : promotions,
        )
      })
      .catch(() => {
        if (isMounted) {
          setItems(promotions)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingPromotions(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="min-h-dvh bg-[#070707] px-4 pb-5 text-white">
      <div className="mx-auto w-full max-w-2xl">
        <nav className="sticky top-0 z-20 -mx-4 mb-5 border-b border-white/10 bg-[#070707]/94 px-4 py-3 backdrop-blur">
          <div className="relative mx-auto flex min-h-11 w-full max-w-2xl items-center justify-center">
            {selectedPromotion ? (
              <button
                aria-label="กลับไปหน้าโปรโมชัน"
                className="absolute left-0 grid size-11 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition active:scale-95"
                onClick={() => setSelectedPromotion(null)}
                type="button"
              >
                <ChevronLeft size={28} strokeWidth={2.6} />
              </button>
            ) : null}
            <div className="flex min-w-0 items-center justify-center gap-3 px-12">
              <img
                alt="FullTank Garage"
                className="h-11 w-11 shrink-0 rounded-xl object-cover shadow-[0_10px_24px_rgba(255,64,59,0.18)]"
                src={fulltankGarageLogo}
              />
              <h1 className="min-w-0 truncate text-center text-[22px] font-black leading-none text-white">
                โปรโมชันล่าสุด
              </h1>
            </div>
          </div>
        </nav>

        {selectedPromotion ? (
          <PromotionDetail promotion={selectedPromotion} />
        ) : (
          <section className="space-y-4">
            {isLoadingPromotions ? <PromotionListSkeleton /> : null}
            {items.map((promotion) => (
              <PromotionCard
                key={promotion.title}
                onOpen={() => setSelectedPromotion(promotion)}
                promotion={promotion}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

function PromotionCard({
  onOpen,
  promotion,
}: {
  onOpen: () => void
  promotion: Promotion
}) {
  return (
    <article className="overflow-hidden rounded-[1.35rem] border border-white/12 bg-[#151515] shadow-[0_0_34px_rgba(255,30,26,0.14)]">
      <button className="block w-full text-left" onClick={onOpen} type="button">
        <PromotionMedia promotion={promotion} />

        <div className="p-4">
          <h2 className="text-xl font-black">{promotion.title}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/62">
            {promotion.description}
          </p>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white/62">
              <CalendarDays size={17} />
              ถึง {promotion.validUntil}
            </div>
            <div className="flex items-center gap-1 text-sm font-black text-[#ff6965]">
              อ่านรายละเอียด
              <ChevronRight className="text-[#ff403b]" size={20} />
            </div>
          </div>
        </div>
      </button>
    </article>
  )
}

function PromotionDetail({
  promotion,
}: {
  promotion: Promotion
}) {
  return (
    <article className="overflow-hidden rounded-[1.35rem] border border-white/12 bg-[#151515] shadow-[0_0_34px_rgba(255,30,26,0.14)]">
      <PromotionMedia promotion={promotion} />

      <div className="p-5">
        <h2 className="text-2xl font-black leading-tight text-white">
          {promotion.title}
        </h2>
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-3 text-sm font-black text-white/68">
          <CalendarDays className="text-[#ff403b]" size={18} />
          ใช้ได้ถึง {promotion.validUntil}
        </div>
        <p className="mt-5 text-base font-semibold leading-8 text-white/70">
          {promotion.description}
        </p>
        <div className="mt-5 rounded-2xl border border-[#ff403b]/22 bg-[#ff403b]/8 p-4">
          <h3 className="text-sm font-black text-white">
            รายละเอียดโปรโมชัน
          </h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/62">
            สามารถแสดงเงื่อนไข ส่วนลด ระยะเวลา และรายละเอียดเพิ่มเติมจากหลังบ้านได้ที่หน้านี้ เมื่อต้องการสอบถามเพิ่มเติมให้ติดต่อ FullTank Garage ผ่าน LINE หรือหน้าร้าน
          </p>
        </div>
      </div>
    </article>
  )
}

function PromotionMedia({ promotion }: { promotion: Promotion }) {
  return (
    <div className={`relative aspect-[16/9] bg-gradient-to-br ${promotion.gradient}`}>
      {promotion.imageUrl ? (
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          src={promotion.imageUrl}
        />
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(255,255,255,0.2),transparent_28%),linear-gradient(135deg,transparent,rgba(0,0,0,0.58))]" />
      <div className="absolute bottom-5 left-5 right-5">
        <p className="break-words text-4xl font-black tracking-tight text-white sm:text-5xl">
          {promotion.imageText}
        </p>
        <img
          alt="FullTank Garage"
          className="mt-3 h-auto w-40 rounded-lg object-cover opacity-90"
          src={fulltankGarageLogo}
        />
      </div>
    </div>
  )
}

function PromotionListSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }, (_, index) => (
        <article
          aria-hidden="true"
          className="overflow-hidden rounded-[1.35rem] border border-white/12 bg-[#151515] shadow-[0_0_34px_rgba(255,30,26,0.14)]"
          key={index}
        >
          <div className="relative aspect-[16/9] skeleton-shimmer">
            <div className="absolute bottom-5 left-5 h-10 w-44 rounded-xl bg-black/20" />
            <div className="absolute bottom-5 left-5 mt-3 h-8 w-36 translate-y-12 rounded-lg bg-black/20" />
          </div>
          <div className="p-4">
            <div className="h-6 w-24 rounded-full skeleton-shimmer" />
            <div className="mt-4 h-6 w-4/5 rounded-xl skeleton-shimmer" />
            <div className="mt-3 h-4 w-full rounded-xl skeleton-shimmer" />
            <div className="mt-2 h-4 w-2/3 rounded-xl skeleton-shimmer" />
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
              <div className="h-5 w-36 rounded-xl skeleton-shimmer" />
              <div className="size-5 rounded-full skeleton-shimmer" />
            </div>
          </div>
        </article>
      ))}
    </>
  )
}

const formatThaiDate = (value?: string) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default App
