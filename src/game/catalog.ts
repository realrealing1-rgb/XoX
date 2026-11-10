import { GameMetadata, GameId } from './types';

export const GAME_CATALOG: GameMetadata[] = [
  {
    id: 'classic-xox',
    order: 1,
    name: 'Klasik XoX',
    shortName: 'Klasik 3×3',
    tagline: 'Geleneksel 3×3 ızgarada kusursuz üçlü hizalama düellosu.',
    gridLabel: '3×3 Izgara',
    winConditionLabel: '3 Taş Hiza',
    rules: [
      'Oyuncular sırayla 3×3 tahtadaki boş bir hücreye X veya O koyar.',
      'Yatay, dikey veya çapraz olarak 3 sembolü ilk hizalayan kazanır.',
      'Tüm hücreler dolduğunda üçlü hiza yoksa oyun berabere biter.'
    ],
    tacticalTip: 'Merkez kare (5 numaralı hücre) 4 farklı kazanma çizgisini kontrol eder.'
  },
  {
    id: 'infinite-xox',
    order: 2,
    name: 'Sonsuz XoX',
    shortName: 'Sonsuz XoX',
    tagline: 'Tahtada en fazla 3 taşınız kalır; 4. hamlede en eski taşınız silinir!',
    gridLabel: '3×3 Dinamik',
    winConditionLabel: 'Kaybolmadan 3 Hiza',
    rules: [
      'Her oyuncunun tahtada aynı anda en fazla 3 taşı bulunabilir.',
      '3 taşınız varken 4. taşınızı koyduğunuzda, ilk koyduğunuz en eski taş tahtadan kalkar.',
      'Sıradaki turda silinecek olan en eski taş kesikli halka ile işaretlenir; beraberlik yoktur!'
    ],
    tacticalTip: 'Rakibinizin hangi taşının bir sonraki hamlede silineceğini takip ederek savunma hattını delin.'
  },
  {
    id: 'ultimate-xox',
    order: 3,
    name: 'Süper XoX (Ultimate)',
    shortName: 'Süper 9×9',
    tagline: 'Hamleniz rakibin bir sonraki turda hangi alt tahtada oynayacağını belirler.',
    gridLabel: '9×9 Alt Tahta',
    winConditionLabel: '3 Alt Tahta Hiza',
    rules: [
      'Tahta 9 adet 3×3 küçük XoX tahtasından oluşur.',
      'Küçük bir tahtada seçtiğiniz hücrenin konumu (ör. sağ üst), rakibinizi büyük tahtanın aynı konumdaki (sağ üst) alt tahtasına gönderir.',
      'Hedef alt tahta zaten kazanılmış veya dolmuşsa, rakip istediği açık alt tahtada oynayabilir.',
      '3 alt tahtayı yatay, dikey veya çapraz kazanan büyük oyunu kazanır.'
    ],
    tacticalTip: 'Rakibinizi zaten kazanılmış bir alt tahtaya göndermekten kaçının; aksi halde serbest hamle hakkı verirsiniz.'
  },
  {
    id: 'gobblet-xox',
    order: 4,
    name: 'Gobblet XoX (Yutan Taşlar)',
    shortName: 'Gobblet 3×3',
    tagline: 'Büyük taşlar küçük taşların üzerine kapanarak onları yutabilir!',
    gridLabel: '3×3 Katmanlı',
    winConditionLabel: 'Üstte 3 Görünür Hiza',
    rules: [
      'Her oyuncunun Küçük (1), Orta (2) ve Büyük (3) boyutta ikişer taşı vardır.',
      'Turunuzda elinizdeki bir taşı boş bir kareye koyabilir veya tahtadaki daha küçük bir taşın (rakibin veya kendinizin) üzerine kapatabilirsiniz.',
      'En üstte görünen taşlardan yatay, dikey veya çapraz 3’lü hiza yapan kazanır.'
    ],
    tacticalTip: 'Büyük (3) taşlarınızı erken harcamayın; rakibin kazanmak üzere olduğu kareyi yutmak için saklayın.'
  },
  {
    id: 'numeric-xox',
    order: 5,
    name: 'Sayısal XoX (Toplam 15)',
    shortName: 'Sayısal 15',
    tagline: 'Tek sayılar Çift sayılara karşı: Toplamı tam 15 olan çizgiyi kuran kazanır.',
    gridLabel: '3×3 Toplam 15',
    winConditionLabel: 'Çizgi Toplamı = 15',
    rules: [
      'X oyuncusu Tek sayıları (1, 3, 5, 7, 9), O oyuncusu Çift sayıları (2, 4, 6, 8) kullanır.',
      'Her sayı oyun boyunca yalnızca bir kez kullanılabilir.',
      'Yatay, dikey veya çapraz 3 dolu hücrenin sayısal toplamını tam 15 yapan oyuncu (kimin taşı olduğuna bakılmaksızın) kazanır!'
    ],
    tacticalTip: 'Dikkat: Rakibinizin koyduğu sayılarla kendi sayınızı toplayarak da 15 yapabilirsiniz!'
  },
  {
    id: 'tapatan-xox',
    order: 6,
    name: 'Üç Taş (Kaydırmalı)',
    shortName: 'Üç Taş',
    tagline: 'Önce 3 taşınızı yerleştirin, sonra komşu çizgiler boyunca kaydırarak hizalayın.',
    gridLabel: '3×3 Raylı',
    winConditionLabel: 'Kaydırarak 3 Hiza',
    rules: [
      '1. Aşama (Yerleştirme): Oyuncular sırayla 3’er taşını tahtaya yerleştirir.',
      '2. Aşama (Kaydırma): 6 taş yerleştirildikten sonra oyuncular sırayla kendi taşlarından birini seçip yatay, dikey veya çapraz komşu boş kareye kaydırır.',
      'Yatay, dikey veya çapraz 3’lü hiza oluşturan kazanır.'
    ],
    tacticalTip: 'Merkez kareyi ele geçiren oyuncu her yöne kayma avantajına sahip olur.'
  },
  {
    id: 'misere-xox',
    order: 7,
    name: 'Ters XoX (Kaçış)',
    shortName: 'Ters 4×4',
    tagline: 'Üçlü hiza yapan KAYBEDER! Rakibinizi üçlü yapmaya zorlayın.',
    gridLabel: '4×4 Tuzak',
    winConditionLabel: '3’lü Hizadan Kaçın',
    rules: [
      '4×4 tahtada oyuncular sırayla kendi sembollerini yerleştirir.',
      'Yatay, dikey veya çapraz olarak kendi sembolünden 3 tanesini yan yana getiren oyuncu anında KAYBEDER!',
      'Rakibini 3’lü hiza yapmaya mecbur bırakan oyuncu kazanır.'
    ],
    tacticalTip: 'Taşlarınızı birbirinden birer boşluk uzakta tutarak son turlarda güvenli kareler bırakın.'
  },
  {
    id: 'connect4-xox',
    order: 8,
    name: 'Dörtlü Hiza (Yerçekimli)',
    shortName: 'Dörtlü Hiza',
    tagline: 'Sütundan bırakılan taşlar en alt boş kareye düşer; 4 taşı hizalayan kazanır.',
    gridLabel: '7×6 Dikey',
    winConditionLabel: '4 Taş Hiza',
    rules: [
      'Bir sütundaki herhangi bir kareye tıkladığınızda taşınız yerçekimiyle o sütunun en alt boş hücresine yerleşir.',
      'Yatay, dikey veya çapraz olarak 4 taşını kesintisiz hizalayan ilk oyuncu kazanır.'
    ],
    tacticalTip: 'Ortadaki sütunu (4. sütun) kontrol etmek yatay ve çapraz dörtlü bağlantılarını ikiye katlar.'
  },
  {
    id: 'obstacle-xox',
    order: 9,
    name: 'Kaya Kalesi XoX',
    shortName: 'Kaya Kalesi',
    tagline: 'Bazalt kayalarla bölünmüş 5×5 arenada engellerin etrafından 4’lü hiza kurun.',
    gridLabel: '5×5 Engelli',
    winConditionLabel: '4 Taş Hiza',
    rules: [
      '5×5 tahtada üzerinde hamle yapılamayan 3 adet sabit bazalt engel karesi bulunur.',
      'Oyuncular boş karelere sırayla taş koyarak yatay, dikey veya çapraz 4’lü hiza yapmaya çalışır.'
    ],
    tacticalTip: 'Engellerin bulunmadığı açık koridorları ve uzun köşegenleri erken tutun.'
  },
  {
    id: 'gomoku-xox',
    order: 10,
    name: 'Gomoku (Beş Taş)',
    shortName: 'Gomoku 9×9',
    tagline: 'Uzak Doğu’nun klasik 9×9 strateji tahtasında kesintisiz 5 taş hizalama.',
    gridLabel: '9×9 Geniş',
    winConditionLabel: '5 Taş Hiza',
    rules: [
      '9×9 ızgarada oyuncular sırayla taşlarını boş kesişim hücrelerine yerleştirir.',
      'Yatay, dikey veya çapraz 5 taşı arka arkaya hizalayan ilk oyuncu kazanır.'
    ],
    tacticalTip: 'İki ucu da açık bir 4’lü ("Açık Dörtlü") oluşturduğunuzda rakibiniz iki ucu birden kapatamaz!'
  },
  {
    id: 'sos-xox',
    order: 11,
    name: 'SOS Düellosu',
    shortName: 'SOS 5×5',
    tagline: 'S veya O harfi yerleştirerek SOS dizilimleri kurun, puan ve ekstra hamle kazanın!',
    gridLabel: '5×5 Harf',
    winConditionLabel: 'En Çok SOS Puanı',
    rules: [
      'Turunuzda alt araç çubuğundan "S" veya "O" harfini seçip boş bir kareye yerleştirin.',
      'Hamleniz yatay, dikey veya çapraz "S-O-S" oluşturursa her SOS için 1 puan kazanırsınız ve SIRA SİZDE KALIR (ekstra hamle)!',
      'Tüm kareler dolduğunda en yüksek SOS puanına sahip oyuncu kazanır.'
    ],
    tacticalTip: 'Boş bir karenin yanına S ve O koyarak rakibinize hazır SOS fırsatı bırakmamaya dikkat edin.'
  },
  {
    id: 'dots-boxes',
    order: 12,
    name: 'Kutu Kapmaca',
    shortName: 'Kutu Kapmaca',
    tagline: 'Noktalar arasındaki çizgileri birleştirin; 4. kenarı kapatan kutuyu ve ekstra turu alır!',
    gridLabel: '3×3 Kutu',
    winConditionLabel: 'En Çok Kutu (5+)',
    rules: [
      'Oyuncular sırayla noktalar arasındaki boş yatay veya dikey çizgilerden birine tıklayarak çizgi çeker.',
      'Bir karenin 4. ve son kenarını kapatan oyuncu o kutuyu kendi sembolüyle (X/O) fetheder, 1 puan alır ve hemen EKSTRA HAMLE yapar!',
      '9 kutunun tamamı kapandığında en çok kutuya sahip olan kazanır.'
    ],
    tacticalTip: 'Bir kutunun 3. kenarını çizmekten kaçının; aksi halde rakibiniz 4. kenarı kapatıp zincirleme kutular alabilir.'
  },
  {
    id: 'reversi-xox',
    order: 13,
    name: 'Reversi XoX (Kıskaç)',
    shortName: 'Reversi 6×6',
    tagline: 'Rakip taşları iki taşınız arasına sıkıştırarak kendi sembolünüze dönüştürün!',
    gridLabel: '6×6 Dönüşüm',
    winConditionLabel: 'En Çok Taş Hakimiyeti',
    rules: [
      'Oyun merkezdeki 4 çapraz taşla başlar. Yalnızca en az 1 rakip taşını kıskaca alan (çeviren) karelere hamle yapılabilir.',
      'Koyduğunuz taş ile mevcut bir taşınız arasında yatay, dikey veya çapraz sıkışan tüm rakip taşlar sizin sembolünüze dönüşür.',
      'Geçerli hamlesi kalmayan oyuncunun sırası pas geçer; tahta dolduğunda en çok taşı olan kazanır.'
    ],
    tacticalTip: 'Köşe kareler (1, 6, 31, 36) asla rakip tarafından kıskaca alınamaz; köşeleri ele geçiren oyunu domine eder!'
  }
];

export function getGameMetadata(id: GameId): GameMetadata {
  return GAME_CATALOG.find((g) => g.id === id) || GAME_CATALOG[0];
}
