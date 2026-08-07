/**
 * Seed 2 SEO blog posts.
 * Run: node server/seeds/seed-blog.js
 */
import db from '../db.js';

const posts = [
  {
    title: "Etkili CV Hazırlama, Staj Bulma ve Mülakat Teknikleri: Üniversite Öğrencileri İçin Kariyer Rehberi",
    slug: "etkili-cv-hazirlama-staj-bulma-ve-mulakat-teknikleri-universite-ogrencileri-icin-kariyer-rehberi",
    date: "2026-03-16",
    category: "Haber",
    is_featured: 1,
    excerpt: "Üniversite öğrencileri için etkili CV hazırlama yöntemleri, staj bulma stratejileri ve mülakat ipuçları. GKT'nin Kariyer Günleri, teknik gezileri ve mentorluk programlarıyla kariyerine nasıl yön verebileceğini keşfet.",
    content: `<p>Üniversite yılları, kariyerinin temellerini attığın ve kim olmak istediğini keşfettiğin en kritik dönem. Ancak <strong>etkili bir CV nasıl hazırlanır</strong>, staj başvurusu nasıl yapılır ya da mülakata nasıl hazırlanılır gibi sorulara çoğu öğrenci net bir cevap bulamıyor. <em>Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu (GKT)</em> olarak 2002'den bu yana bu soruların cevabını binlerce öğrenciye birlikte keşfettik. Bu rehberde staj arayışından mülakat sürecine kadar ihtiyacın olan her şeyi derliyoruz.</p>

<h2>Staj Nasıl Bulunur? Staj Arama Stratejileri</h2>

<p>Staj aramaya <strong>ne kadar erken başlarsan o kadar avantajlı</strong> olursun. İkinci sınıfın bahar döneminden itibaren fırsatları takip etmek, rakiplerinin bir adım önüne geçmeni sağlar. Çoğu şirket yaz stajı başvurularını <em>mart-nisan aylarında</em> açar; LinkedIn, Kariyer.net ve şirketlerin kariyer sayfaları en iyi başlangıç noktaların.</p>

<p>Ama en etkili yöntem çoğu zaman göz ardı edilen bir strateji: <strong>doğrudan iletişim</strong>. İlgilendiğin şirkete kısa, profesyonel bir e-posta göndermek, açık ilan olmasa bile kapıları açabilir. Burada önemli olan samimi ama profesyonel bir dil tutturmak ve neden o şirkette staj yapmak istediğini net ifade etmek.</p>

<p>GKT olarak her yıl düzenlediğimiz <strong>Kariyer Günleri</strong>'nde 50'den fazla firma ile öğrencilerimizi birebir buluşturuyoruz. CV atölyeleri, mock interview oturumları ve firma standlarında gerçekleşen görüşmeler sayesinde birçok üyemiz daha mezun olmadan staj ve iş teklifleri alıyor. Bunun yanı sıra <strong>teknik gezilerimizde</strong> fabrikaları, teknokentleri ve startup ofislerini yerinde ziyaret ederek iş dünyasını bir öğrenci gözünden değil, içeriden tanıma fırsatı yakalıyoruz. <em>Genç Rota</em>, <em>QNB Career</em> gibi sektörel etkinliklerimizde ise bankacılıktan teknolojiye kadar farklı sektörlerin kapılarını öğrencilere aralıyoruz.</p>

<h2>Etkili CV Nasıl Hazırlanır?</h2>

<p>Henüz iş deneyimin olmasa bile etkili bir CV hazırlamak mümkün. Önemli olan elindeki malzemeyi doğru sunmak. İşte CV hazırlarken dikkat etmen gereken temel noktalar:</p>

<p><strong>CV'ni tek sayfada tut.</strong> İnsan kaynakları uzmanları bir CV'ye ortalama <em>altı ila yedi saniye</em> ayırır. Bilgilerini kısa, net ve okunması kolay bir formatta sun. Uzun paragraflar yerine madde işaretleriyle özetlemek her zaman daha etkili.</p>

<p><strong>Deneyim bölümünde sadece iş tecrübesi olmak zorunda değil.</strong> Topluluk çalışmaların, gönüllülük projelerin, yarışmalar ve akademik projeler de CV'nde yer alması gereken değerli deneyimler. GKT'de departman çalışması yapmak, etkinlik organize etmek, sponsorlarla kurumsal iletişim yürütmek, sosyal medya yönetmek veya web sitesi geliştirmek gibi sorumluluklar gerçek iş hayatına doğrudan transfer edilebilen beceriler kazandırır. Topluluğumuzun dört departmanında — <em>Medya ve IT, Etkinlik ve Organizasyon, Kurumsal İlişkiler ve Üye İlişkileri</em> — üyelerimiz takım çalışması, proje yönetimi ve liderlik deneyimlerini CV'lerine somut başarılarla yansıtıyor.</p>

<p><strong>Her başvuru için CV'ni özelleştir.</strong> Başvurduğun pozisyonun gerektirdiği yetkinlikleri öne çıkar. Bir pazarlama stajına başvuruyorsan sosyal medya deneyimini, bir finans pozisyonuna başvuruyorsan analitik becerilerini vurgula. Aynı CV'yi her yere göndermek yerine birkaç dakika ayırıp uyarlamak başvurunu kalabalıktan ayırır.</p>

<p><strong>Profesyonel bir görünüm sağla.</strong> Temiz bir fotoğraf, adın, telefon numaran, e-posta adresin ve LinkedIn profilin yeterli. Doğum tarihi, medeni durum gibi gereksiz bilgilere yer verme. Tasarım olarak sade ve okunaklı bir şablon tercih et.</p>

<h2>Mülakat İpuçları: Mülakata Nasıl Hazırlanılır?</h2>

<p>Mülakat daveti aldığında ilk adımın <strong>şirketi detaylıca araştırmak</strong> olmalı. Ne iş yaptıklarını, sektördeki konumlarını, son dönemdeki projelerini öğren. <em>"Şirketimiz hakkında ne biliyorsunuz?"</em> sorusu neredeyse her mülakatın başlangıç noktası ve bu soruya verdiğin cevap ilk izlenimi belirliyor.</p>

<p><strong>"Kendinizden bahsedin"</strong> sorusuna hazırlıklı ol. Bu aslında "profesyonel hikayeni anlat" demek. Kronolojik bir özgeçmiş okumak yerine seni bu noktaya getiren motivasyonu, kazandığın deneyimleri ve hedeflerini bir iki dakikada özetle. GKT'de edindiğin sorumluluklar, organize ettiğin etkinlikler veya yönettiğin projeler bu hikayenin güçlü parçaları olabilir.</p>

<p><strong>Mülakatçıya sorular sor.</strong> Mülakat tek taraflı bir sınav değil, karşılıklı bir tanışma. <em>"Stajyerlerden beklentileriniz neler?"</em>, <em>"Ekipte bir günüm nasıl geçer?"</em> veya <em>"Şirkette gelişim fırsatları neler?"</em> gibi sorular hem ilgini hem de ciddi hazırlığını gösterir.</p>

<p><strong>Reddedilmekten korkma.</strong> Her ret seni bir sonraki başvuruya daha hazır hale getirir. Önemli olan denemekten vazgeçmemek ve her deneyimden bir ders çıkarmak.</p>

<h2>Networking: Kariyerinin Gizli Silahı</h2>

<p>Kariyerinde en büyük farkı çoğu zaman <strong>tanıdığın insanlar</strong> yaratır. Araştırmalar iş pozisyonlarının önemli bir kısmının ilan edilmeden, referanslar aracılığıyla doldurulduğunu gösteriyor. Bu yüzden networking sadece bir seçenek değil, <em>kariyer stratejinin temel taşı</em>.</p>

<p>GKT'nin tüm etkinlikleri aslında birer networking fırsatı. <strong>Kariyer Günleri</strong>'nde firma yöneticileriyle birebir görüşüyorsun. <strong>Ofis sohbetlerinde</strong> sektör profesyonellerine samimi bir ortamda sorularını yöneltiyorsun. <strong>Teknik gezilerde</strong> iş yerlerini yerinde görüp çalışanlarla tanışıyorsun. <strong>Ulusal Girişimcilik Zirvesi</strong>'nde ise Türkiye'nin dört bir yanından binlerce öğrenci ve yüzlerce profesyonelle aynı ortamı paylaşıyorsun.</p>

<p>LinkedIn profilini aktif tut, etkinliklerde tanıştığın kişilere bağlantı isteği gönder, katıldığın etkinlikleri paylaş. Bu küçük adımlar zamanla güçlü bir profesyonel ağ oluşturur.</p>

<h2>İlk Adımı Bugün At</h2>

<p>Kariyerine yön vermek için mezun olmayı bekleme. Her başvuru, her etkinlik, her yeni bağlantı seni bir adım ileriye taşır. <strong>GKT olarak tam da bu yolculukta yanındayız</strong> — Kariyer Günleri'nden teknik gezilere, mentorluk programlarından zirvelere kadar kariyerinin her aşamasında sana destek oluyoruz.</p>

<p><em>Sen de bu yolculuğun bir parçası olmak istiyorsan topluluğumuza katıl. <strong>Birlikte daha güçlüyüz.</strong></em></p>`
  },
  {
    title: "LinkedIn Profili Nasıl Optimize Edilir? Üniversite Öğrencileri İçin Rehber",
    slug: "linkedin-profili-nasil-optimize-edilir",
    date: "2026-03-14",
    category: "Haber",
    is_featured: 0,
    excerpt: "LinkedIn profilini profesyonel bir şekilde düzenleyerek staj ve iş fırsatlarını artırabilirsin. Profil fotoğrafından başlık yazısına, deneyim bölümünden networking stratejilerine kadar adım adım rehber.",
    content: `<p>Günümüzde <strong>LinkedIn</strong>, iş dünyasının en güçlü sosyal medya platformu. İnsan kaynakları uzmanlarının büyük çoğunluğu adayları işe almadan önce LinkedIn profillerini inceliyor. Peki öğrenciyken bu platformu nasıl etkili kullanabilirsin? İşte <strong>LinkedIn profil düzenleme</strong> rehberin.</p>

<h2>Neden LinkedIn Bu Kadar Önemli?</h2>

<p>LinkedIn sadece iş arayanlar için değil, kariyerini inşa eden herkes için kritik bir araç. Araştırmalar, İK uzmanlarının %90'ından fazlasının adayları LinkedIn üzerinden araştırdığını gösteriyor. Öğrenciyken profil oluşturmanın en büyük avantajı, mezun olduğunda zaten güçlü bir dijital varlığa sahip olmandır. Erken başlamak seni rakiplerinin bir adım önüne geçirir.</p>

<p>Üstelik LinkedIn sadece iş bulmak için değil, <strong>profesyonel ağ kurma</strong>, sektörel gelişmeleri takip etme ve kişisel markani oluşturma açısından da vazgeçilmez. GKT olarak etkinliklerimizde tanıştığın sektör profesyonelleriyle bağlantı kurabileceğin ilk yer genellikle LinkedIn oluyor.</p>

<h2>Adım Adım LinkedIn Profili Optimize Etme</h2>

<h3>1. Profil Fotoğrafı</h3>

<p>İlk izlenim her şeydir. Profil fotoğrafın profesyonel, net ve güler yüzlü olmalı. Sade bir arka plan tercih et. Selfie, grup fotoğrafı veya tatil karelerinden uzak dur. Bir arkadaşından düz bir duvar önünde portre çekmesini istemen yeterli — stüdyo şart değil.</p>

<h3>2. Başlık Yazısı (Headline)</h3>

<p><strong>LinkedIn başlık yazısı</strong> profilinin en çok görünen kısmı. "Akdeniz Üniversitesi Öğrencisi" yazmak yerine hedefini ve ilgi alanlarını belirt. Örneğin: <em>"Akdeniz Üniversitesi | İşletme Bölümü | Pazarlama ve Dijital İletişim Meraklısı"</em> çok daha etkili. Anahtar kelimeler içeren bir başlık, arama sonuçlarında üst sıralarda çıkmanı sağlar.</p>

<h3>3. Hakkında (About) Bölümü</h3>

<p>Bu bölüm senin profesyonel hikayeni anlatacağın alan. Kim olduğunu, ne hedeflediğini ve hangi becerilerini geliştirdiğini 3-5 paragrafta özetle. İlk iki cümle kritik çünkü önizlemede sadece onlar görünüyor. Somut örnekler ver: hangi projelerde yer aldın, hangi etkinlikleri organize ettin, hangi araçları kullanıyorsun.</p>

<h3>4. Deneyim Bölümü</h3>

<p><strong>LinkedIn deneyim bölümü</strong> sadece resmi iş deneyimleri için değil. Staj, yarı zamanlı iş, gönüllülük çalışmaları ve topluluk deneyimlerinin hepsi buraya eklenmeli. GKT gibi topluluk çalışmalarını mutlaka ekle. Örneğin:</p>

<ul>
<li><em>"Medya ve IT Departmanı Üyesi — Sosyal medya içerik üretimi, grafik tasarım, etkinlik canlı yayın desteği"</em></li>
<li><em>"Kurumsal İlişkiler Departmanı — Sponsor görüşmeleri, protokol süreçleri, paydaş iletişimi"</em></li>
</ul>

<p>Her deneyimde ne yaptığını ve ne kazandığını yaz. Mümkünse rakamlarla destekle: <em>"3.000+ katılımcılı ulusal zirvenin sosyal medya kampanyasını yürüttüm"</em> cümlesi, <em>"sosyal medya ile ilgilendim"</em>den çok daha güçlü.</p>

<h3>5. Eğitim ve Beceriler</h3>

<p>Üniversite, bölüm ve ilgili dersleri ekle. Topluluk üyeliklerini de eğitim bölümünde belirtebilirsin. Beceriler kısmına en az 5-10 beceri ekle ve arkadaşlarından karşılıklı onay iste. Hedeflediğin sektörle ilgili becerileri öne çıkar.</p>

<h3>6. Paylaşım ve Etkileşim</h3>

<p>Profil oluşturmak yeterli değil, aktif olman gerekiyor. Haftada en az bir paylaşım veya yorum yap. Katıldığın etkinlikleri paylaş ve ilgili kişileri etiketle. Sektörel makalelere yorum yapmak bile görünürlüğünü artırır.</p>

<h2>GKT Üyeliği LinkedIn Profilini Nasıl Güçlendirir?</h2>

<p>Bir <strong>öğrenci topluluğunda</strong> aktif rol almak, LinkedIn profilini somut deneyimlerle doldurmanın en etkili yolu. GKT'deki departman çalışmaların — etkinlik organizasyonu, sponsorluk görüşmeleri, proje yönetimi, web geliştirme — gerçek iş hayatına doğrudan transfer edilebilen beceriler. Kariyer Günleri'nde ve zirvelerde tanıştığın firma temsilcileriyle LinkedIn'de bağlantı kurmak, profesyonel ağını genişletmenin en doğal yolu.</p>

<h2>Sık Yapılan Hatalar</h2>

<ul>
<li>Profili boş bırakmak veya fotoğraf koymamak</li>
<li>Başlığa sadece "İş arıyorum" yazmak — bunun yerine değer önerisini belirt</li>
<li>Profil oluşturup hiç etkileşime girmemek</li>
<li>Deneyimleri genel cümlelerle yazmak, somut detay vermemek</li>
</ul>

<h2>Bugün Başla</h2>

<p>Mükemmel profili beklemek yerine bugün küçük bir adım at. Fotoğrafını güncelle, başlığını yeniden yaz, bir deneyim ekle. Her hafta küçük güncellemeler yaparak profelin zamanla güçlenecek. GKT etkinliklerini ve topluluk deneyimlerini eklemeyi unutma — bu deneyimler seni diğer adaylardan ayıracak en güçlü kozların.</p>

<p><em>Sen de GKT ailesine katılarak kariyerine profesyonel bir başlangıç yap. LinkedIn profilinde yazacak çok şeyin olsun.</em></p>`
  },
  {
    title: "Üniversitede Topluluk Üyeliğinin Kariyere 5 Büyük Katkısı",
    slug: "universite-topluluk-uyeligi-kariyer-katkisi",
    date: "2026-03-12",
    category: "Haber",
    is_featured: 0,
    excerpt: "Bir öğrenci topluluğuna üye olmak sadece sosyalleşmek değil, kariyerinin temellerini atmak demek. İşte topluluk deneyiminin sana kazandıracağı 5 kritik beceri ve fırsat.",
    content: `<p>Üniversite yılları sadece derslerden, sınavlardan ve notlardan ibaret değil. İş verenler CV'de akademik başarının yanında <strong>topluluk deneyimi</strong> görmeyi giderek daha fazla önemsiyor. Neden mi? Çünkü bir <strong>öğrenci topluluğunda</strong> kazandığın beceriler, hiçbir derste öğretilemeyecek kadar gerçek ve uygulamalı.</p>

<p>Akdeniz Üniversitesi Girişimcilik ve Kariyer Topluluğu (GKT) olarak 2002'den bu yana binlerce öğrencinin kariyer yolculuğuna tanıklık ettik. İşte <strong>üniversitede topluluk üyeliğinin</strong> kariyerine sağlayacağı 5 büyük katkı.</p>

<h2>1. Takım Çalışması ve Proje Yönetimi</h2>

<p>Bir toplulukta aktif görev almak, gerçek projeler ve gerçek sorumluluklar demek. 3.000 kişilik bir ulusal zirve organize etmeyi düşün: mekan seçimi, lojistik koordinasyon, konuşmacı davetleri, sponsor görüşmeleri, program akışı tasarımı, sahne yönetimi... Tüm bunlar bir ekip halinde, deadline baskısı altında yürütülüyor.</p>

<p>Bu deneyim hiçbir ders kitabında yok. Kriz anında hızlı karar vermeyi, ekip arkadaşlarınla etkili iletişim kurmayı ve birden fazla işi aynı anda yönetmeyi <strong>yaparak öğreniyorsun</strong>. İş görüşmelerinde "proje yönetimi deneyiminiz var mı?" sorusuna somut örneklerle cevap verebilmek büyük avantaj.</p>

<h2>2. Liderlik ve İnisiyatif Alma</h2>

<p>Topluluklar, <strong>üniversitede liderlik</strong> deneyimi kazanmanın en erişilebilir yolu. Departman koordinatörü veya takım direktörü olarak kendi ekibini yönetme, kendi projeni önerme ve yürütme fırsatı buluyorsun.</p>

<p>GKT'de Medya ve IT departmanında web sitesi geliştirmekten, Kurumsal İlişkilerde sponsor görüşmeleri yürütmeye kadar geniş bir yelpazede liderlik deneyimi kazanabilirsin. Liderlik, mezuniyet sonrası iş dünyasında en çok aranan becerilerden biri — ve en iyi öğrenme yolu sorumluluk alarak pratik yapmak.</p>

<h2>3. Networking ve Profesyonel Bağlantılar</h2>

<p>İş dünyasının açık sırrı: pozisyonların önemli bir kısmı ilan edilmeden, referanslar aracılığıyla dolduruluyor. Bir topluluk üyeliği, <strong>profesyonel ağ kurmanın</strong> en doğal yolu.</p>

<p>GKT Kariyer Günleri'nde 50'den fazla firma ile birebir tanışıyorsun. Ulusal Girişimcilik Zirvesi'nde sektör liderleriyle aynı ortamı paylaşıyorsun. Ofis sohbetlerinde CEO'lara doğrudan soru sorabiliyorsun. Bu bağlantılar, mezuniyet öncesi staj tekliflerine ve mezuniyet sonrası iş fırsatlarına dönüşüyor. Birçok GKT üyesi kariyerine topluluk etkinliklerinde kurduğu bağlantılar sayesinde yön verdi.</p>

<h2>4. Teknik ve Profesyonel Beceriler</h2>

<p>Hangi departmana katılırsan o alanda uygulamalı deneyim kazanıyorsun. <strong>Öğrenci kulübü avantajlarının</strong> en somut olanı bu:</p>

<ul>
<li><strong>Medya ve IT:</strong> Grafik tasarım, video prodüksiyon, web geliştirme, sosyal medya yönetimi</li>
<li><strong>Etkinlik ve Organizasyon:</strong> Mekan yönetimi, program planlama, sahne koordinasyonu, moderasyon</li>
<li><strong>Kurumsal İlişkiler:</strong> Kurumsal iletişim, sunum hazırlama, müzakere teknikleri, bütçe planlaması</li>
<li><strong>Üye İlişkileri:</strong> İnsan kaynakları süreçleri, motivasyon çalışmaları, veri analizi, iç iletişim</li>
</ul>

<p>Bu beceriler CV'de somut satırlara dönüşüyor. "Adobe Photoshop biliyorum" demek başka, "3.000 kişilik zirvenin tüm görsel materyallerini tasarladım" demek başka.</p>

<h2>5. Özgüven ve Kişisel Gelişim</h2>

<p>Sahneye çıkmak, topluluk önünde konuşmak, farklı karakterdeki insanlarla çalışmak, uzlaşmak, ikna etmek... Bunların hepsi konfor alanından çıkmayı gerektiriyor ve her biri bir <strong>kariyer gelişimi</strong> fırsatı.</p>

<p>GKT'de ilk defa sponsor görüşmesine giden çekingen bir öğrencinin, bir dönem sonra ulusal zirvenin sahnesini yönettiğini defalarca gördük. Bu dönüşüm, hiçbir online kursun veya kitabın sağlayamayacağı kadar güçlü. Gerçek ortamlarda, gerçek insanlarla, gerçek sorumluluklar alarak büyüyorsun.</p>

<h2>Nasıl Başlamalısın?</h2>

<p>İlgi alanına göre bir departman seç. İlk dönem gözlemle, ortamı tanı, etkinliklere katıl. İkinci dönem sorumluluk almaya başla. Her fırsatta elini kaldır, her projede yer al. Üniversite yılların sınırlı — onları en verimli şekilde değerlendirmenin yolu, sınıfın dışına çıkmak.</p>

<p>Unutma: bir topluluk üyeliği sadece CV'ye bir satır eklemek değil. Gerçek iş deneyimi, gerçek bağlantılar ve gerçek beceriler kazanmak demek. GKT, 2002'den bu yana 6.000'den fazla öğrencinin kariyer yolculuğuna katkı sağladı.</p>

<p><em>Sen de GKT ailesine katılarak geleceğine yatırım yap. Başvurular her dönem başında açılıyor — bu fırsatı kaçırma.</em></p>`
  }
];

const tx = db.transaction(() => {
  let count = 0;
  for (const p of posts) {
    const existing = db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(p.slug);
    if (existing) continue;
    db.prepare('INSERT INTO blog_posts (title, slug, date, category, is_featured, excerpt, content) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      p.title, p.slug, p.date, p.category, p.is_featured, p.excerpt, p.content
    );
    count++;
  }
  console.log(`✓ ${count} blog yazısı eklendi (${posts.length - count} zaten mevcut)`);
});

tx();
db.close();
