from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.colors import HexColor
from reportlab.pdfgen.canvas import Canvas
from pathlib import Path

OUT = Path('/home/rayan/resik/docs/Panduan_Penggunaan_Fastko_Recycle.pdf')
OUT.parent.mkdir(parents=True, exist_ok=True)

GREEN = HexColor('#059669')
DARK = HexColor('#0f172a')
SLATE = HexColor('#475569')
LIGHT = HexColor('#ecfdf5')
AMBER = HexColor('#fffbeb')
BORDER = HexColor('#cbd5e1')

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='CoverTitle', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=29, leading=35, textColor=DARK, alignment=TA_CENTER, spaceAfter=10))
styles.add(ParagraphStyle(name='CoverSub', parent=styles['Normal'], fontName='Helvetica', fontSize=14, leading=20, textColor=SLATE, alignment=TA_CENTER, spaceAfter=8))
styles.add(ParagraphStyle(name='H1x', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=20, leading=25, textColor=DARK, spaceBefore=10, spaceAfter=9))
styles.add(ParagraphStyle(name='H2x', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=14, leading=18, textColor=GREEN, spaceBefore=10, spaceAfter=5))
styles.add(ParagraphStyle(name='H3x', parent=styles['Heading3'], fontName='Helvetica-Bold', fontSize=11.5, leading=15, textColor=DARK, spaceBefore=7, spaceAfter=3))
styles.add(ParagraphStyle(name='Bodyx', parent=styles['BodyText'], fontName='Helvetica', fontSize=9.5, leading=14, textColor=SLATE, spaceAfter=5))
styles.add(ParagraphStyle(name='Smallx', parent=styles['BodyText'], fontName='Helvetica', fontSize=8, leading=11, textColor=SLATE, spaceAfter=3))
styles.add(ParagraphStyle(name='Bulletx', parent=styles['BodyText'], fontName='Helvetica', fontSize=9.3, leading=13.5, leftIndent=13, firstLineIndent=-8, textColor=SLATE, spaceAfter=3))
styles.add(ParagraphStyle(name='Stepx', parent=styles['BodyText'], fontName='Helvetica', fontSize=9.5, leading=14, leftIndent=18, firstLineIndent=-18, textColor=SLATE, spaceAfter=4))
styles.add(ParagraphStyle(name='Callout', parent=styles['BodyText'], fontName='Helvetica-Bold', fontSize=9.2, leading=13, textColor=DARK, backColor=LIGHT, borderColor=GREEN, borderWidth=0.6, borderPadding=8, spaceBefore=5, spaceAfter=8))


def P(text, style='Bodyx'):
    return Paragraph(text, styles[style])


def bullets(items):
    return [P('- ' + x, 'Bulletx') for x in items]


def steps(items):
    return [P(f'{i}. {x}', 'Stepx') for i, x in enumerate(items, 1)]


def info_table(rows, widths=None):
    data = [[P(str(a), 'Smallx'), P(str(b), 'Smallx')] for a, b in rows]
    t = Table(data, colWidths=widths or [42*mm, 125*mm], hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.3, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 7), ('RIGHTPADDING', (0,0), (-1,-1), 7),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    return t


def section_title(title, subtitle=None):
    out = [P(title, 'H1x')]
    if subtitle:
        out.append(P(subtitle, 'Bodyx'))
    return out


def header_footer(canvas: Canvas, doc):
    canvas.saveState()
    w, h = A4
    if doc.page > 1:
        canvas.setStrokeColor(GREEN)
        canvas.setLineWidth(1)
        canvas.line(18*mm, h-15*mm, w-18*mm, h-15*mm)
        canvas.setFont('Helvetica-Bold', 8)
        canvas.setFillColor(GREEN)
        canvas.drawString(18*mm, h-11.5*mm, 'Fastko Recycle')
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(SLATE)
        canvas.drawRightString(w-18*mm, h-11.5*mm, 'Panduan Penggunaan')
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(18*mm, 13*mm, w-18*mm, 13*mm)
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(SLATE)
    canvas.drawString(18*mm, 8.5*mm, 'fastkorecycle.com')
    canvas.drawRightString(w-18*mm, 8.5*mm, f'Halaman {doc.page}')
    canvas.restoreState()

story = []
# Cover
story += [Spacer(1, 35*mm), P('FASTKO RECYCLE', 'CoverTitle'), P('Panduan Penggunaan Aplikasi', 'CoverSub'), Spacer(1, 8*mm)]
cover = Table([[P('<b>Admin</b><br/>Mengelola pelanggan, petugas, wilayah, penugasan, pembayaran, dan konten.', 'Bodyx'), P('<b>Petugas Lapangan</b><br/>Menerima order, memperbarui status, menyelesaikan penjemputan, dan mengirim koordinat GPS.', 'Bodyx'), P('<b>Pengguna / Pelanggan</b><br/>Mendaftar, meminta penjemputan, melihat tagihan, membayar, dan mengunduh invoice.', 'Bodyx')]], colWidths=[53*mm]*3)
cover.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),LIGHT),('BOX',(0,0),(-1,-1),0.7,GREEN),('INNERGRID',(0,0),(-1,-1),0.4,BORDER),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10)]))
story += [cover, Spacer(1, 14*mm), P('Dokumen ini menjelaskan alur penggunaan Fastko Recycle pada alamat <b>https://fastkorecycle.com/</b>. Menu dapat tampil sedikit berbeda sesuai hak akses akun dan pembaruan aplikasi.', 'Bodyx'), Spacer(1, 8*mm), P('<b>Catatan keamanan:</b> Jangan membagikan password. Setelah login pertama kali, gunakan password yang kuat dan keluar dari akun pada perangkat bersama.', 'Callout'), PageBreak()]

# TOC and overview
story += section_title('1. Gambaran Umum', 'Fastko Recycle menghubungkan pelanggan, admin, dan petugas lapangan dalam satu alur layanan pengelolaan sampah.')
story += [P('Alur utama layanan:', 'H2x')]
story += steps([
    'Pelanggan membuat akun atau menerima akun dari admin.',
    'Admin memverifikasi akun pelanggan dan mengatur tanggal jatuh tempo serta nominal iuran.',
    'Pelanggan mengajukan permintaan penjemputan sampah.',
    'Admin menugaskan permintaan tersebut kepada petugas lapangan.',
    'Petugas memperbarui status perjalanan dan menyelesaikan tugas.',
    'Sistem menampilkan tagihan bulanan. Invoice muncul pada periode tujuh hari sebelum jatuh tempo.',
    'Pelanggan membayar melalui transfer bank, QRIS, atau cash kepada petugas sesuai prosedur.',
    'Admin memverifikasi pembayaran. Pembayaran tanpa bukti bank/QRIS yang disetujui admin dicatat sebagai Bayar Cash.'
])
story += [P('Akses aplikasi:', 'H2x'), info_table([
    ('Website publik', 'https://fastkorecycle.com/'),
    ('Login', 'Gunakan menu Masuk pada website.'),
    ('Registrasi pelanggan', 'Gunakan menu Daftar. Akun menunggu verifikasi admin sebelum dapat digunakan.'),
    ('Dokumen invoice', 'Dibuka dari menu Tagihan & Iuran, lalu pilih Print / Save PDF.'),
]), PageBreak()]

# Common login
story += section_title('2. Akses Akun dan Login')
story += [P('Setiap peran menggunakan akun masing-masing. Setelah login, sistem mengarahkan pengguna ke dashboard sesuai perannya.', 'Bodyx'), P('Pelanggan baru:', 'H2x')] + steps([
    'Buka https://fastkorecycle.com/ lalu pilih Daftar.',
    'Isi data identitas, email, password, alamat, dan informasi lokasi yang diminta.',
    'Kirim formulir registrasi. Status akun akan menunggu verifikasi administratif.',
    'Tunggu admin menyetujui akun. Jika sudah aktif, login menggunakan email dan password.',
]) + [P('Login dan keluar:', 'H2x')] + bullets([
    'Buka menu Masuk, masukkan email dan password, lalu pilih Login.',
    'Jika gagal masuk, pastikan email, password, dan status akun sudah aktif.',
    'Pilih Keluar Halaman / Logout setelah selesai, terutama pada perangkat umum.'
]) + [P('Jika lupa password atau akun belum aktif, hubungi admin Fastko Recycle.', 'Callout'), PageBreak()]

# Admin
story += section_title('3. Panduan Admin', 'Admin mengendalikan data operasional dan validasi transaksi.')
story += [P('Menu Admin:', 'H2x'), info_table([
    ('Ringkasan', 'Melihat jumlah pelanggan, petugas, tugas, tagihan, dan pendapatan.'),
    ('Verifikasi Pelanggan', 'Meninjau pelanggan, menyetujui/menolak pendaftaran, mengedit data, mengatur jatuh tempo, dan nominal iuran.'),
    ('Petugas Lapangan', 'Membuat akun petugas serta mengaktifkan/nonaktifkan petugas.'),
    ('Wilayah Kerja', 'Mengelola wilayah kerja yang digunakan dalam operasional pickup.'),
    ('Penugasan Pickup', 'Melihat permintaan pickup dan menugaskannya kepada petugas.'),
    ('Verifikasi Pembayaran', 'Memeriksa tagihan, bukti pembayaran, lalu menerima atau menolak pembayaran.'),
    ('Metode Pembayaran', 'Mengatur transfer bank, QRIS, dan metode pembayaran lain yang tampil kepada pelanggan.'),
    ('Konten & Berita', 'Mengelola berita/konten informasi pada website.'),
]), P('3.1 Verifikasi dan pengaturan pelanggan', 'H2x')] + steps([
    'Buka Verifikasi Pelanggan dan gunakan kolom pencarian bila diperlukan.',
    'Untuk pendaftar baru, buka Detail, periksa data, lalu pilih Setujui atau Tolak.',
    'Pilih Edit untuk mengubah nama, email, nomor HP, alamat, status, tanggal jatuh tempo, dan jumlah iuran bulanan.',
    'Pada kolom Iuran Bulanan, masukkan nominal rupiah tanpa titik atau simbol, misalnya 75000. Tekan Enter atau klik di luar field untuk menyimpan.',
    'Pada kolom Tgl Jatuh Tempo, masukkan tanggal 1 sampai 31. Sistem menyesuaikan tanggal dengan jumlah hari pada bulan berjalan.',
    'Jika pelanggan perlu dihapus, pilih Hapus dan konfirmasi. Data akun serta data pelanggan terkait ikut dihapus sesuai alur aplikasi.'
])
story += [P('Aturan invoice: perubahan nominal dipakai untuk invoice baru. Jika invoice bulan berjalan masih Belum Bayar atau Jatuh Tempo, nominal invoice tersebut ikut disinkronkan. Invoice yang sudah Lunas tidak diubah.', 'Callout'), PageBreak()]

story += section_title('3.2 Mengelola petugas dan penugasan') + steps([
    'Buka Petugas Lapangan lalu buat akun petugas dengan data nama, email, password, NIK, nomor HP, alamat, dan wilayah.',
    'Pastikan petugas berstatus aktif agar dapat menerima tugas.',
    'Buka Penugasan Pickup untuk melihat permintaan pelanggan yang belum memiliki petugas.',
    'Pilih permintaan, tentukan petugas, lalu simpan penugasan.',
    'Pantau status tugas sampai selesai melalui daftar penugasan atau Ringkasan.'
]) + [P('3.3 Verifikasi pembayaran', 'H2x')] + steps([
    'Buka Verifikasi Pembayaran dan cari pelanggan atau invoice.',
    'Jika pelanggan membayar transfer bank atau QRIS, pilih Lihat Bukti untuk memeriksa gambar bukti.',
    'Pilih Terima/Verifikasi jika pembayaran benar. Status menjadi Lunas.',
    'Jika tidak ada bukti bank/QRIS yang valid tetapi admin menerima pembayaran tunai, klik Terima/Verifikasi. Sistem otomatis mencatat metode sebagai <b>Bayar Cash</b>.',
    'Jika bukti tidak sesuai, pilih Tolak. Pembayaran kembali menjadi belum lunas dan bukti yang tersimpan dihapus dari transaksi tersebut.'
]) + [P('3.4 Pengaturan metode dan konten', 'H2x')] + bullets([
    'Metode Pembayaran: tambah atau ubah nama metode, tipe, rekening, pemilik rekening, QRIS, dan deskripsi.',
    'Konten & Berita: buat, ubah, atau hapus berita yang tampil pada website publik.',
    'Profil perusahaan: gunakan pengaturan profil untuk memperbarui nama, logo, alamat, telepon, dan email. Header invoice menggunakan nama perusahaan aktif, yaitu Fastko Recycle.'
]), PageBreak()

# Officer
story += section_title('4. Panduan Petugas Lapangan', 'Petugas menerima penugasan pickup dan memperbarui progres pekerjaan.')
story += [P('Menu petugas:', 'H2x'), info_table([
    ('Ringkasan Tugas', 'Melihat total tugas, tugas aktif, dan tugas selesai.'),
    ('Daftar Order', 'Melihat detail pelanggan dan memperbarui status order.'),
    ('Kirim Koordinat GPS', 'Mengirim koordinat lokasi petugas ke sistem.'),
]), P('4.1 Menangani order pickup', 'H2x')] + steps([
    'Login menggunakan akun petugas yang diberikan admin.',
    'Buka Daftar Order dan pilih order yang ditugaskan kepada Anda.',
    'Periksa nama pelanggan, alamat, jadwal, tipe sampah, estimasi berat, catatan, dan detail lokasi.',
    'Perbarui status sesuai kondisi lapangan: Menunggu, Diproses, Dalam Perjalanan, Selesai, atau Batal.',
    'Setelah pickup selesai, buka form penyelesaian tugas.',
    'Masukkan berat aktual, biaya penanganan bila ada, dan foto setelah penjemputan jika tersedia.',
    'Kirim penyelesaian. Sistem mencatat tugas selesai dan dapat menerbitkan nota/tagihan terkait.'
]) + [P('4.2 Mengirim GPS', 'H2x')] + steps([
    'Buka Kirim Koordinat GPS.',
    'Pilih deteksi lokasi jika browser meminta izin lokasi, atau masukkan latitude dan longitude.',
    'Pilih Kirim Koordinat GPS.',
    'Pastikan pesan berhasil muncul. Jangan memberikan izin lokasi pada website lain yang tidak dikenal.'
]) + [P('Tips petugas:', 'H2x')] + bullets([
    'Hubungi pelanggan bila alamat atau jadwal sulit ditemukan.',
    'Perbarui status secara berurutan agar admin dan pelanggan mendapat informasi yang akurat.',
    'Foto setelah pekerjaan harus jelas dan tidak memuat data pribadi yang tidak diperlukan.'
]) + [PageBreak()]

# Customer
story += section_title('5. Panduan Pengguna / Pelanggan', 'Pelanggan dapat meminta layanan pickup dan mengelola tagihan dari dashboard.')
story += [P('Menu pelanggan:', 'H2x'), info_table([
    ('Ringkasan', 'Melihat ringkasan pickup dan tagihan terbaru.'),
    ('Jemput Sampah', 'Membuat permintaan penjemputan baru.'),
    ('Riwayat', 'Melihat status dan riwayat permintaan pickup.'),
    ('Tagihan & Iuran', 'Melihat invoice, memilih metode pembayaran, mengunggah bukti, dan mencetak invoice.'),
]), P('5.1 Mengajukan penjemputan sampah', 'H2x')] + steps([
    'Buka menu Jemput Sampah.',
    'Isi tanggal dan waktu pickup yang diinginkan.',
    'Pilih tipe sampah dan masukkan estimasi berat.',
    'Tambahkan catatan bila ada, misalnya patokan rumah atau instruksi khusus.',
    'Ambil atau masukkan lokasi GPS bila tersedia agar petugas mudah menemukan alamat.',
    'Tambahkan foto pendukung bila diminta, lalu kirim permintaan.',
    'Pantau status permintaan melalui menu Riwayat.'
]) + [P('5.2 Memantau riwayat pickup', 'H2x')] + bullets([
    'Menunggu: permintaan belum diproses atau belum ditugaskan.',
    'Diproses: permintaan sedang ditangani admin/petugas.',
    'Dalam Perjalanan: petugas sedang menuju lokasi.',
    'Selesai: pickup telah diselesaikan.',
    'Batal: permintaan dibatalkan.'
]) + [PageBreak()]

story += section_title('5.3 Melihat dan membayar tagihan') + steps([
    'Buka Tagihan & Iuran. Invoice bulanan akan tampil ketika sudah masuk periode tujuh hari sebelum jatuh tempo.',
    'Periksa nomor invoice, bulan tagihan, jumlah iuran, tanggal invoice, tanggal jatuh tempo, dan status.',
    'Pilih metode pembayaran yang tersedia: Transfer Bank atau QRIS. Pembayaran cash dilakukan kepada petugas/admin sesuai arahan.',
    'Untuk transfer bank atau QRIS, lakukan pembayaran sesuai nominal invoice.',
    'Pilih file foto bukti pembayaran. Gunakan gambar yang jelas dan maksimal 2 MB.',
    'Kirim bukti pembayaran. Bukti hanya boleh dikirim untuk tagihan milik akun sendiri.',
    'Tunggu admin melakukan verifikasi. Setelah diterima, status menjadi Lunas.',
    'Jika membayar cash tanpa bukti bank/QRIS, sampaikan kepada admin/petugas. Admin akan menekan verifikasi dan sistem mencatat Bayar Cash.'
]) + [P('5.4 Print / Save PDF invoice', 'H2x')] + steps([
    'Pada invoice yang ingin dicetak, pilih Lihat Invoice atau tombol Print.',
    'Pada halaman invoice pilih Print / Save PDF.',
    'Di dialog browser, pilih printer atau Save as PDF.',
    'Pastikan nama header dokumen tertulis Fastko Recycle, lalu simpan file di lokasi yang aman.'
]) + [P('Jika bukti tidak terlihat admin:', 'H2x')] + bullets([
    'Refresh dashboard lalu pilih ulang file bukti pembayaran.',
    'Pastikan file benar-benar berupa gambar dan ukurannya tidak lebih dari 2 MB.',
    'Jangan hanya mengetik nama file; gunakan tombol pilih file dan tunggu pesan berhasil.',
    'Jika masih gagal, simpan screenshot pesan error dan hubungi admin.'
]) + [PageBreak()]

# SOP and troubleshooting
story += section_title('6. Status, Pembayaran, dan Pemecahan Masalah')
story += [P('Status pembayaran:', 'H2x'), info_table([
    ('Belum Bayar / Unpaid', 'Invoice belum dibayar atau belum ada pembayaran yang disetujui.'),
    ('Menunggu Verifikasi / Pending', 'Bukti pembayaran sudah dikirim dan menunggu pemeriksaan admin.'),
    ('Lunas / Paid', 'Pembayaran sudah disetujui admin.'),
    ('Bayar Cash', 'Pembayaran disetujui admin tanpa bukti transfer bank/QRIS; metode tercatat cash.'),
    ('Jatuh Tempo', 'Tanggal jatuh tempo telah lewat dan invoice belum lunas.'),
]), P('Masalah umum:', 'H2x'), info_table([
    ('Tidak bisa login', 'Periksa email/password dan pastikan admin sudah mengaktifkan akun.'),
    ('Invoice belum tampil', 'Periksa apakah sudah masuk H-7 sebelum jatuh tempo. Refresh dashboard dan hubungi admin bila data jatuh tempo belum benar.'),
    ('Bukti pembayaran tidak terlihat', 'Upload ulang gambar maksimal 2 MB dari menu Tagihan & Iuran; jangan hanya mengirim nama file.'),
    ('Nominal invoice salah', 'Admin perlu memeriksa Iuran Bulanan pada Verifikasi Pelanggan. Invoice belum lunas bulan berjalan dapat disinkronkan.'),
    ('Order belum ditugaskan', 'Admin perlu membuka Penugasan Pickup dan memilih petugas.'),
    ('GPS gagal dikirim', 'Izinkan geolocation pada browser, gunakan koneksi stabil, atau masukkan koordinat secara manual.'),
    ('Halaman menampilkan data lama', 'Refresh halaman. Pada perangkat yang menyimpan cache lama, tutup tab lalu buka kembali website.'),
]), P('Kontak bantuan internal:', 'H2x'), P('Saat melapor, sertakan nama akun, menu yang bermasalah, waktu kejadian, nomor invoice/order bila ada, dan screenshot pesan error. Jangan kirim password atau kode rahasia.', 'Callout'), PageBreak()]

# checklist
story += section_title('7. Checklist Operasional')
story += [P('Checklist admin harian:', 'H2x')] + bullets([
    'Periksa pendaftar baru dan status akun.',
    'Periksa permintaan pickup yang belum ditugaskan.',
    'Pantau order aktif dan order yang selesai.',
    'Periksa pembayaran Pending dan bukti transfer/QRIS.',
    'Catat pembayaran cash melalui tombol verifikasi.',
    'Pastikan nominal iuran dan jatuh tempo pelanggan tetap benar.',
]) + [P('Checklist petugas setiap order:', 'H2x')] + bullets([
    'Baca detail pelanggan dan jadwal.',
    'Perbarui status saat berangkat dan tiba.',
    'Masukkan berat aktual dan biaya bila diperlukan.',
    'Kirim foto setelah pekerjaan bila tersedia.',
    'Tandai tugas selesai dan kirim koordinat GPS bila diminta.'
]) + [P('Checklist pelanggan setiap bulan:', 'H2x')] + bullets([
    'Cek tagihan dan tanggal jatuh tempo.',
    'Bayar sesuai nominal invoice.',
    'Upload bukti yang jelas bila transfer/QRIS.',
    'Pastikan status sudah Lunas atau Bayar Cash setelah verifikasi.',
    'Simpan invoice PDF untuk arsip.'
]) + [Spacer(1, 12*mm), P('Akhir panduan', 'H1x'), P('Gunakan Fastko Recycle secara tertib, jaga kerahasiaan akun, dan komunikasikan perubahan jadwal atau pembayaran kepada admin/petugas melalui kanal resmi.', 'Bodyx')]

def flatten_flowables(items):
    result = []
    for item in items:
        if isinstance(item, list):
            result.extend(flatten_flowables(item))
        else:
            result.append(item)
    return result

story = flatten_flowables(story)

for i, item in enumerate(story):
    if isinstance(item, list):
        print('nested index', i, 'value', item)
        raise TypeError(f'Nested flowable list at index {i}')

doc = SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=18*mm, leftMargin=18*mm, topMargin=22*mm, bottomMargin=18*mm, title='Panduan Penggunaan Fastko Recycle', author='Fastko Recycle')
doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
print(OUT)
