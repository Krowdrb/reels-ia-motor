# Genera guiones/jose-el-sonador.json (video largo horizontal, ~10 min). Uso: python3 guiones/jose-el-sonador.py
import json, os

# ---- personajes recurrentes ----
def J(x, **k):      # José joven con su túnica de colores (iluminado)
    return dict(who='robed', x=x, lit=True, coat=True, **k)
def Js(x, **k):     # José en silueta
    return dict(who='robed', x=x, **k)
def JE(x, **k):     # José gobernador de Egipto
    return dict(who='robed', x=x, lit=True, nemes=True, collar=True, robe='#F4EEDF', **k)
def JAC(x, **k):    # Jacob, anciano
    return dict(who='robed', x=x, beard=True, staff=True, **k)
def BROS(x, n=5, **k):
    return dict(who='crowd', x=x, n=n, **k)
def PH(x, **k):
    return dict(who='pharaoh', x=x, lit=True, **k)
def sh(set_, cam='push', chars=(), fx=(), at=None, **k):
    d = dict(set=list(set_), cam=cam, chars=list(chars), fx=list(fx), **k)
    if at: d['at'] = at
    return d
E = lambda el, x=.5, **k: dict(el=el, x=x, **k)
def S(mood, vo, shots, trans='fade', chapter=None, climax=False):
    d = dict(mood=mood, trans=trans, vo=vo, shots=shots)
    if chapter: d['chapter'] = dict(n=chapter[0], text=chapter[1], dur=3.8)
    if climax: d['climax'] = True
    return d

CANAAN = [E('tent', .22), E('tent', .34, s=.8), E('palm', .82), E('olive', .1, depth='far'), 'hills']
EGYPT = [E('pyramid', .28), E('pyramid', .5, s=.7), E('obelisk', .8), 'dunes']
STARS = [E('star', .2 + i * .06, sy=.10 + (i % 3) * .06, s=.8) for i in range(11)]

scenes = [
# ======== apertura ========
S('night', 'A los diecisiete años, sus propios *hermanos* lo arrojaron a un pozo y lo vendieron como *esclavo*.', [
    sh([E('pit', .5), 'rocks', E('olive', .15)], 'push', [BROS(.25, 3), BROS(.75, 3, pose='point')], ['fog', 'dust'], focus=dict(x=.5, y=.7), light=dict(x=.7, y=.12)),
    sh(['dunes', E('camels', .15, n=5, rider=True, speed=40)], 'panR', [], ['dust'], at='vendieron', mood='dusk')], trans='cut'),
S('golden', 'Trece años después, era el hombre más *poderoso* de Egipto. Solo el faraón estaba por encima de él.', [
    sh([E('palace', .5), E('obelisk', .12), E('obelisk', .88), E('pyramid', .5, depth='far', s=.6)], 'pull', [JE(.5, depth='mid', glow=True)], ['rays', 'dust'], light=dict(x=.5, y=.15))], trans='flare'),
S('night', '¿Cómo llega un esclavo olvidado en una *cárcel* hasta el trono de un imperio? Y lo más difícil: ¿qué hizo cuando tuvo frente a él a los que lo *traicionaron*?', [
    sh([E('prison', .5, wx=-250)], 'push', [Js(.36, pose='kneel')], ['dust'], focus=dict(x=.4, y=.6)),
    sh([E('palace', .5)], 'tiltDown', [JE(.5, depth='mid'), BROS(.5, 6, pose='bow', depth='near')], ['rays'], at='frente', mood='dusk')], trans='dip'),
S('dawn', 'Esta es la historia de *José*, el soñador, en el libro de Génesis. Y quédate hasta el final, porque la última escena cambia la manera de mirar tu propio *dolor*.', [
    sh(['hills', E('olive', .2), E('olive', .78, depth='near'), E('sheep', .55)], 'rise', [J(.45)], ['fog', 'rays'], light=dict(x=.62, y=.25))]),

# ======== 1. El hijo favorito ========
S('golden', 'Todo empieza en la tierra de *Canaán*. Jacob tenía doce hijos, pero a uno lo amaba más que a todos: a José, el primer hijo de *Raquel*, la esposa que más amó.', [
    sh(CANAAN + [E('sheep', .6)], 'panR', [JAC(.42), Js(.5, s=.8), BROS(.75, 4, depth='mid')], ['dust']),
    sh(CANAAN, 'push', [JAC(.42, lit=True, robe='#8A6A4A'), J(.55, s=.85)], ['rays'], at='José', focus=dict(x=.5, y=.6))], chapter=('CAPÍTULO 1', 'El hijo favorito')),
S('golden', 'Y le hizo un regalo que lo cambió todo: una *túnica* especial. La versión más conocida la llama la túnica de *muchos colores*.', [
    sh([E('tent', .3), E('palm', .8), 'hills'], 'push', [J(.5, glow=True), JAC(.36, lit=True, robe='#8A6A4A')], ['rays', 'dust'], focus=dict(x=.5, y=.55), light=dict(x=.55, y=.15))]),
S('dusk', 'Sus hermanos lo vieron, y entendieron el *mensaje*. Dice la Biblia que lo *aborrecían*, y que ni siquiera podían hablarle en paz.', [
    sh([E('tent', .7), E('olive', .2), 'hills'], 'panL', [BROS(.32, 6, depth='near'), J(.75, depth='mid')], ['dust'])]),
S('night', 'Una noche, José tuvo un *sueño*. Estaban atando gavillas en el campo. Su gavilla se levantó... y las gavillas de sus hermanos se *inclinaron* ante ella.', [
    sh(['ground', E('wheat', .5, n=42, gap=52)], 'panR', [], ['dust'], light=dict(x=.75, y=.15)),
    sh(['ground', E('sheaves', .5, n=11, bow=False, lit=True, s=1.25), E('wheat', .5, depth='far', n=30)], 'push', [], ['dust', 'rays'], at='Su'),
    sh(['ground', E('sheaves', .5, n=11, bow=True, lit=True, s=1.25), E('wheat', .5, depth='far', n=30)], 'push', [], ['rays', 'dust'], at='inclinaron', trans='flare', mood='holy')], trans='dip'),
S('night', 'Luego tuvo un segundo sueño: el *sol*, la *luna* y once estrellas se inclinaban ante él. Y con apenas diecisiete años, se lo contó a todos.', [
    sh(['hills'] + STARS, 'tiltUp', [], ['dust'], light=dict(x=.82, y=.15)),
    sh(CANAAN, 'push', [J(.5, depth='mid'), BROS(.25, 3), JAC(.75)], [], at='contó', mood='dusk')]),
S('dusk', 'Hasta su padre lo reprendió: ¿acaso vamos a inclinarnos ante ti? Pero Jacob guardó esas palabras. Y sus hermanos le tuvieron *envidia*.', [
    sh([E('tent', .4), 'hills'], 'push', [JAC(.45, pose='point'), J(.6, s=.85)], ['dust']),
    sh([E('olive', .5), 'hills'], 'pull', [BROS(.5, 6, depth='near')], ['fog'], at='hermanos', mood='night')]),

# ======== 2. La cisterna ========
S('day', 'Un día, los hermanos estaban lejos pastoreando los rebaños, y Jacob envió a José a ver cómo *estaban*. No sabía que pasarían más de *veinte años* antes de volver a verlo.', [
    sh(CANAAN, 'push', [JAC(.4, pose='point'), J(.55)], []),
    sh(['hills', E('olive', .85)], 'panR', [J(.3, depth='mid')], ['dust'], at='No', mood='dusk')], chapter=('CAPÍTULO 2', 'La cisterna')),
S('dusk', 'Lo vieron venir desde lejos, con su túnica, y dijeron: ahí viene el *soñador*. Vamos a matarlo, y veremos qué pasa con sus *sueños*.', [
    sh(['hills', E('rocks', .7), E('olive', .2, depth='mid')], 'push', [J(.62, depth='far'), BROS(.3, 5, depth='near', pose='point')], ['dust'], focus=dict(x=.6, y=.5))]),
S('dusk', 'Pero Rubén, el mayor, los detuvo: no derramen sangre, échenlo en esta *cisterna*. Él pensaba *rescatarlo* después y devolverlo a su padre.', [
    sh([E('pit', .55), 'rocks'], 'push', [dict(who='robed', x=.38, pose='open'), BROS(.75, 4)], ['dust'], focus=dict(x=.55, y=.7))]),
S('night', 'Le quitaron la túnica y lo arrojaron al pozo. Estaba *vacío*, sin agua. Y mientras José les suplicaba desde el fondo, ellos se sentaron a *comer*.', [
    sh([E('pit', .5), E('coat', .7)], 'push', [BROS(.25, 3)], ['fog', 'dust'], focus=dict(x=.5, y=.72)),
    sh([E('pit', .3), E('olive', .8)], 'pull', [BROS(.65, 5, pose='bow')], ['fog'], at='ellos')], trans='dip'),
S('dusk', 'Entonces apareció una caravana de *ismaelitas* camino a Egipto. Y Judá tuvo una idea: ¿qué ganamos con matarlo? *Vendámoslo*.', [
    sh(['dunes', E('camels', .05, n=5, rider=True, speed=55)], 'panR', [], ['dust']),
    sh([E('pit', .3), 'rocks'], 'push', [dict(who='robed', x=.55, pose='point'), BROS(.75, 3)], [], at='Judá')]),
S('dusk', 'Lo vendieron por *veinte piezas de plata*. Cuando Rubén volvió a la cisterna, José ya no estaba. Y rasgó sus *vestidos*.', [
    sh(['dunes', E('camels', .3, n=4, rider=True, speed=35), E('sacks', .8, lit=True, s=.6)], 'push', [Js(.55, depth='mid', pose='bow')], ['dust']),
    sh([E('pit', .5)], 'pull', [dict(who='robed', x=.4, pose='arms')], ['fog'], at='Rubén', mood='night')]),
S('night', 'Luego tomaron la túnica de colores, la mancharon con la sangre de un *cabrito*, y se la llevaron a su padre.', [
    sh(['ground', E('coat', .5, s=1.4)], 'push', [BROS(.25, 3, pose='bow')], ['fog'], focus=dict(x=.5, y=.8))]),
S('night', 'Jacob la reconoció. Una fiera lo devoró, dijo. Rasgó sus ropas, se vistió de luto, y no quiso ser *consolado*. Lloraré a mi hijo hasta la *tumba*.', [
    sh([E('tent', .5), 'hills', E('coat', .56, s=.8)], 'push', [JAC(.45, pose='kneel'), dict(who='mourners', x=.75, n=3, pose='bow')], ['fog', 'dust']),
    sh(['hills', E('cypress', .3), E('cypress', .7)], 'pull', [JAC(.5, pose='mourn')], ['fog'], at='Lloraré')], trans='dip'),
S('dusk', 'Mientras tanto, en Egipto, un muchacho de diecisiete años era vendido otra vez. Esta vez a *Potifar*, el capitán de la guardia del *faraón*.', [
    sh(EGYPT + [E('camels', .1, n=4, rider=True, speed=30)], 'panR', [], ['dust']),
    sh([E('palace', .5), E('palm', .15)], 'push', [dict(who='soldier', x=.4), Js(.55, pose='bow')], ['dust'], at='Potifar')]),

# ======== 3. Esclavo en Egipto ========
S('day', 'Lo había perdido todo: su familia, su libertad, su túnica. Pero la Biblia repite una frase que lo cambia todo: el Señor estaba *con José*.', [
    sh([E('palace', .5), E('palm', .2), E('palm', .85)], 'still', [Js(.45, pose='bow')], ['dust']),
    sh([E('palace', .5), E('palm', .2)], 'push', [dict(who='robed', x=.5, lit=True, robe='#EFE7D6', glow=True)], ['rays'], at='Señor', mood='golden', trans='flare')], chapter=('CAPÍTULO 3', 'Esclavo en Egipto')),
S('golden', 'Todo lo que hacía *prosperaba*. Potifar lo puso a cargo de toda su casa, y Dios bendijo la casa del egipcio por causa de *José*.', [
    sh([E('granary', .55, lit=True), E('sacks', .2, lit=True)], 'panL', [dict(who='robed', x=.4, lit=True, robe='#EFE7D6'), dict(who='crowd', x=.75, n=3)], ['dust', 'rays'])]),
S('dusk', 'José era joven y de buen parecer, y la esposa de Potifar se fijó en él. Día tras día le insistía que pecara con ella.', [
    sh([E('palace', .5)], 'push', [dict(who='woman', x=.62, veilColor='#8C3B4A'), Js(.38)], ['dust'])]),
S('dusk', 'Y día tras día, José le dijo que *no*. ¿Cómo haría yo este gran mal, y pecaría contra *Dios*?', [
    sh([E('palace', .5)], 'push', [dict(who='robed', x=.42, lit=True, robe='#EFE7D6', pose='open'), dict(who='woman', x=.66)], ['rays'], focus=dict(x=.42, y=.55))]),
S('night', 'Un día ella lo tomó de la ropa. José *huyó*, y dejó la prenda en sus manos. Y con esa prenda, ella lo *acusó* de lo que él se había negado a hacer.', [
    sh([E('palace', .5)], 'panR', [Js(.78), dict(who='woman', x=.35, pose='point')], ['dust']),
    sh([E('palace', .5)], 'push', [dict(who='woman', x=.45, pose='point'), dict(who='soldier', x=.65)], [], at='acusó', mood='storm', events=[dict(at='acusó', do='lightning')])], trans='dip'),
S('night', 'Potifar se llenó de furia. Y José, que había hecho lo *correcto*, terminó en la *cárcel* del rey.', [
    sh([E('prison', .5, wx=200)], 'push', [Js(.58, pose='kneel'), dict(who='soldier', x=.3)], ['dust'], focus=dict(x=.58, y=.6))]),

# ======== 4. Olvidado ========
S('night', 'Imagina estar ahí. Traicionado por tus hermanos. Acusado por hacer el bien. Encerrado en un lugar del que nadie *sale*.', [
    sh([E('prison', .5, wx=200)], 'push', [Js(.6, pose='pray')], ['dust'], focus=dict(x=.6, y=.62))], chapter=('CAPÍTULO 4', 'Olvidado')),
S('night', 'Pero otra vez, la misma frase: el Señor estaba *con José*. Y el jefe de la cárcel puso en sus manos a *todos* los presos.', [
    sh([E('prison', .5, wx=0)], 'rise', [dict(who='robed', x=.5, glow=True), dict(who='crowd', x=.25, n=3, pose='bow'), dict(who='crowd', x=.78, n=3, pose='bow')], ['rays', 'dust'])]),
S('night', 'Un día llegaron dos presos importantes: el jefe de los *coperos* del faraón, y el jefe de los *panaderos*. Una mañana, José los vio *tristes*.', [
    sh([E('prison', .5, wx=-200)], 'panL', [dict(who='robed', x=.35, pose='bow'), dict(who='robed', x=.5, pose='bow'), Js(.7)], ['dust'])]),
S('dawn', 'Los dos habían soñado. Y José les dijo: ¿no son de *Dios* las interpretaciones? Cuéntenmelos.', [
    sh([E('prison', .5, wx=0)], 'push', [dict(who='robed', x=.5, glow=True, pose='open'), dict(who='robed', x=.3), dict(who='robed', x=.7)], ['rays'], focus=dict(x=.5, y=.55))]),
S('dawn', 'Al copero le dijo: en tres días, el faraón te devolverá tu puesto. Y le pidió una sola cosa: cuando estés bien, *acuérdate de mí*.', [
    sh([E('prison', .5, wx=0)], 'push', [dict(who='robed', x=.42, lit=True, robe='#EFE7D6', pose='pray'), dict(who='robed', x=.62)], ['rays']),
    sh([E('palace', .5)], 'pull', [dict(who='robed', x=.5, lit=True, robe='#B5833A', depth='mid')], ['rays'], at='acuérdate', mood='golden')]),
S('night', 'Al panadero, en cambio, le dio una noticia *terrible*. Y en tres días, todo pasó exactamente como José había dicho.', [
    sh([E('prison', .5, wx=200)], 'push', [dict(who='robed', x=.42, pose='bow'), Js(.62)], ['fog'])]),
S('night', 'El copero volvió al palacio... y se *olvidó* de José. Pasaron dos años completos. *Dos años* más en la cárcel.', [
    sh([E('palace', .5)], 'pull', [dict(who='robed', x=.5, depth='mid')], ['dust']),
    sh([E('prison', .5, wx=200)], 'push', [Js(.6, pose='kneel')], ['dust'], at='Pasaron', focus=dict(x=.6, y=.62))], trans='dip'),

# ======== 5. Los sueños del faraón ========
S('storm', 'Hasta que una noche, el hombre más poderoso del mundo tuvo una *pesadilla*. Siete vacas hermosas y gordas subían del río y pastaban en el *prado*.', [
    sh([E('palace', .5, depth='far')], 'push', [PH(.5, depth='mid', pose='bow')], [], events=[dict(at='pesadilla', do='lightning')]),
    sh(['sea', E('cows', .5, n=7, s=1.4, gap=190)], 'panR', [], ['fog'], at='Siete', mood='night')], chapter=('CAPÍTULO 5', 'Los sueños del faraón')),
S('storm', 'Detrás subieron siete vacas *flacas* y feas, que se *comieron* a las gordas. Y seguían igual de flacas.', [
    sh(['sea', E('cows', .5, n=7, thin=True, s=1.4, gap=190)], 'push', [], ['fog'], events=[dict(at='comieron', do='lightning')])]),
S('storm', 'Luego soñó siete espigas llenas, devoradas por siete espigas *secas*. Y ningún sabio de Egipto pudo *explicarlo*.', [
    sh(['ground', E('wheat', .5, n=7, gap=150, lit=True)], 'push', []),
    sh(['ground', E('wheat', .5, n=7, gap=150, thin=True)], 'push', [], [], at='secas', events=[dict(at='secas', do='lightning')]),
    sh([E('palace', .5)], 'pull', [PH(.5, depth='mid'), dict(who='crowd', x=.5, n=6, pose='bow')], [], at='ningún', mood='night')]),
S('dawn', 'Entonces el copero se *acordó*. Sacaron a José de prisa, lo afeitaron, le cambiaron la ropa, y lo pusieron frente al *faraón*.', [
    sh([E('prison', .5, wx=0)], 'push', [dict(who='robed', x=.5, lit=True, robe='#EFE7D6')], ['rays'], at='Sacaron'),
    sh([E('palace', .5)], 'push', [PH(.6, depth='mid'), dict(who='robed', x=.38, lit=True, robe='#F4EEDF')], ['rays'], at='frente', mood='golden')]),
S('golden', 'Me han dicho que tú interpretas sueños, le dijo el faraón. Y José respondió: no está en *mí*. *Dios* le dará al faraón una respuesta de paz.', [
    sh([E('palace', .5), E('obelisk', .15), E('obelisk', .85)], 'push', [PH(.62), dict(who='robed', x=.4, lit=True, robe='#F4EEDF', pose='open', glow=True)], ['rays', 'dust'], focus=dict(x=.45, y=.55))]),
S('golden', 'Los dos sueños son uno solo, explicó José. Vienen siete años de gran *abundancia*, y después siete años de *hambre* que consumirán la tierra.', [
    sh(['ground', E('wheat', .5, n=40, gap=52, lit=True)], 'panR', [], ['rays', 'dust']),
    sh(['dunes', E('wheat', .5, n=24, gap=80, thin=True)], 'push', [], ['dust'], at='hambre', mood='dusk')]),
S('golden', 'Y propuso un plan: guardar la quinta parte de las cosechas en *graneros* durante los años buenos, para que el pueblo no muera en los años *malos*.', [
    sh([E('granary', .5, lit=True), E('sacks', .2, lit=True), E('sacks', .82)], 'pull', [dict(who='crowd', x=.5, n=5, depth='near')], ['rays', 'dust'])]),
S('holy', 'El faraón lo miró y dijo: no hay nadie tan sabio como tú. Le puso su *anillo*, lo vistió de lino fino, le colgó un collar de *oro*... y lo puso sobre toda la tierra de Egipto. José tenía *treinta años*.', [
    sh([E('palace', .5)], 'push', [PH(.6), JE(.42, glow=True)], ['rays', 'dust'], focus=dict(x=.45, y=.5)),
    sh(EGYPT + [E('palace', .5, depth='mid')], 'rise', [JE(.5, depth='mid', glow=True), dict(who='crowd', x=.2, n=4, pose='bow'), dict(who='crowd', x=.8, n=4, pose='bow')], ['rays', 'dust'], at='puso#2')], trans='flare', climax=True),
S('golden', 'Trece años desde la cisterna. Y cuando nacieron sus hijos, les puso nombres que cuentan su historia: *Manasés*, porque Dios le hizo olvidar su dolor. Y *Efraín*, porque Dios lo hizo fructificar en la tierra de su aflicción.', [
    sh([E('palace', .5), E('palm', .15), E('palm', .85)], 'push', [JE(.45), dict(who='woman', x=.6, lit=True, veilColor='#D9A441'), dict(who='child', x=.52), dict(who='child', x=.7, at='Efraín')], ['rays'])]),

# ======== 6. Frente a frente ========
S('dusk', 'Llegaron los siete años de hambre, y alcanzaron hasta Canaán. Jacob les dijo a sus hijos: dicen que en Egipto hay *trigo*. Vayan.', [
    sh(['dunes', E('tent', .3), E('wheat', .7, n=14, thin=True)], 'push', [JAC(.45, pose='point'), BROS(.7, 5)], ['dust'])], chapter=('CAPÍTULO 6', 'Frente a frente')),
S('golden', 'Diez hermanos llegaron ante el gobernador de Egipto... y se *inclinaron* rostro en tierra. Exactamente como en el sueño de las *gavillas*.', [
    sh([E('palace', .5), E('granary', .5, depth='far', s=.7)], 'tiltDown', [JE(.5, depth='mid'), BROS(.5, 8, pose='bow', depth='near')], ['rays', 'dust']),
    sh(['ground', E('sheaves', .5, n=11, bow=True, lit=True, s=1.25)], 'push', [], ['rays'], at='Exactamente', mood='holy', trans='flare')]),
S('dusk', 'José los reconoció al instante. Ellos a él, *no*. Y les habló con dureza: ustedes son *espías*.', [
    sh([E('palace', .5)], 'push', [JE(.35, pose='point'), BROS(.68, 6, pose='bow')], ['dust'], focus=dict(x=.35, y=.5))]),
S('night', 'Los encerró tres días. Y sin saber que él los entendía, se dijeron unos a otros: esto nos pasa por lo que le hicimos a nuestro *hermano*. Vimos su angustia cuando nos *rogaba*, y no lo escuchamos.', [
    sh([E('prison', .5, wx=0)], 'push', [BROS(.5, 7, pose='bow')], ['dust']),
    sh([E('pit', .5)], 'push', [], ['fog'], at='Vimos', focus=dict(x=.5, y=.72))]),
S('night', 'José se apartó de ellos... y *lloró*. Después dejó preso a Simeón, y les exigió que volvieran con *Benjamín*, el hermano menor.', [
    sh([E('palace', .5), E('cypress', .2)], 'push', [JE(.5, pose='mourn')], ['fog', 'dust'], focus=dict(x=.5, y=.5))]),
S('dusk', 'En el camino, uno abrió su saco... y encontró su *plata*. Se les fue el alma: ¿qué es esto que nos ha hecho *Dios*?', [
    sh(['dunes', E('sacks', .45, lit=True, s=1.2)], 'push', [BROS(.72, 4)], ['dust'], focus=dict(x=.45, y=.7))]),
S('dusk', 'El hambre siguió. Y Jacob, con el corazón roto, dejó ir a Benjamín. Judá le dio su palabra: si no te lo traigo de vuelta, que la culpa sea *mía* para siempre.', [
    sh([E('tent', .35), 'dunes'], 'push', [JAC(.4), dict(who='robed', x=.58, s=.85), dict(who='robed', x=.72, pose='open')], ['dust'])], trans='dip'),
S('golden', 'En Egipto, José vio a Benjamín, su único hermano de madre... y tuvo que salir corriendo a *llorar* a solas. Luego les dio un *banquete*.', [
    sh([E('palace', .5)], 'push', [JE(.4), dict(who='robed', x=.6, s=.85)], ['rays']),
    sh([E('palace', .5)], 'pull', [JE(.3), BROS(.65, 9, depth='near')], ['rays', 'dust'], at='banquete')]),
S('night', 'Pero preparó una última *prueba*. Mandó esconder su copa de plata en el saco de Benjamín. Y cuando ya se iban... los *alcanzaron*.', [
    sh(['dunes', E('sacks', .5)], 'push', [dict(who='robed', x=.35, pose='point')], ['dust']),
    sh(['dunes'], 'panL', [BROS(.6, 6), dict(who='soldier', x=.2), dict(who='soldier', x=.28)], ['dust'], at='alcanzaron')]),
S('storm', 'La copa apareció en el saco de *Benjamín*. Los hermanos rasgaron sus vestidos. El que tenga la copa, dijo el mayordomo, se quedará como *esclavo*.', [
    sh(['dunes', E('sacks', .5, lit=True)], 'push', [BROS(.75, 5, pose='mourn')], [], events=[dict(at='Benjamín', do='lightning')]),
    sh([E('palace', .5)], 'push', [JE(.5, depth='mid'), dict(who='robed', x=.42, s=.85, pose='kneel'), BROS(.7, 5, pose='bow')], [], at='mayordomo', mood='night')]),
S('dusk', 'Y ahí pasó algo que nadie esperaba. Judá, el mismo que años antes dijo vendámoslo... dio un paso al *frente*.', [
    sh([E('palace', .5)], 'push', [dict(who='robed', x=.5, lit=True, robe='#7A5A3A'), BROS(.25, 3, pose='bow'), BROS(.78, 3, pose='bow')], ['dust'], focus=dict(x=.5, y=.55))]),
S('dusk', 'Déjame a mí como esclavo en lugar del muchacho, dijo. ¿Cómo voy a volver a mi padre sin él? El hombre que vendió a su hermano, ahora se ofrecía como *esclavo* por su *hermano*.', [
    sh([E('palace', .5)], 'push', [dict(who='robed', x=.45, pose='kneel', lit=True, robe='#7A5A3A'), JE(.68)], ['rays'], focus=dict(x=.5, y=.55)),
    sh([E('pit', .5), 'rocks'], 'pull', [], ['fog'], at='hombre', mood='night')]),

# ======== 7. Yo soy José ========
S('dusk', 'José ya no pudo *contenerse*. Hizo salir a todos los egipcios. Y lloró tan fuerte, que lo *escucharon* hasta en la casa del faraón.', [
    sh([E('palace', .5)], 'push', [JE(.5, pose='mourn'), BROS(.5, 7, depth='near')], ['dust'], focus=dict(x=.5, y=.5))], chapter=('CAPÍTULO 7', 'Yo soy José')),
S('holy', 'Y les dijo: *Yo soy José*. ¿Vive todavía mi padre? Sus hermanos no pudieron responder. Estaban *aterrados*.', [
    sh([E('palace', .5)], 'push', [JE(.5, glow=True, pose='open')], ['rays', 'dust'], focus=dict(x=.5, y=.48)),
    sh([E('palace', .5)], 'pull', [JE(.5, glow=True, depth='mid'), BROS(.5, 8, pose='bow')], ['rays'], at='Sus')], trans='flare', climax=True),
S('holy', 'Acérquense, les dijo. Yo soy José, su hermano, el que ustedes vendieron. Pero no se *entristezcan*... porque para salvar *vidas* me envió Dios delante de ustedes.', [
    sh([E('palace', .5)], 'push', [JE(.5, pose='open', glow=True), BROS(.28, 3), BROS(.72, 3)], ['rays', 'dust'])]),
S('golden', 'No fueron ustedes los que me enviaron aquí, sino *Dios*. Y se echó al cuello de Benjamín, y lloró. Besó a todos sus hermanos. Y después de *todo*... hablaron con él.', [
    sh([E('palace', .5)], 'push', [JE(.48), dict(who='robed', x=.56, s=.85)], ['rays']),
    sh([E('palace', .5)], 'pull', [JE(.5), BROS(.5, 10, depth='near')], ['rays', 'dust'], at='Besó')]),

# ======== 8. El reencuentro ========
S('dawn', 'Volvieron a Canaán con carros de Egipto, y le dijeron a Jacob: José *vive*. Y es señor de toda la tierra de Egipto.', [
    sh(['dunes', E('camels', .1, n=6, speed=40)], 'panR', [], ['fog']),
    sh(CANAAN, 'push', [JAC(.4), BROS(.7, 5)], ['fog', 'rays'], at='José')], chapter=('CAPÍTULO 8', 'El reencuentro')),
S('dawn', 'El corazón del anciano se quedó *frío*. No les creía. Pero cuando vio los carros que José le enviaba, su espíritu *revivió*. Basta, dijo. Mi hijo vive. Iré a verlo antes de *morir*.', [
    sh(CANAAN, 'push', [JAC(.45, pose='mourn')], ['fog']),
    sh(CANAAN, 'push', [JAC(.45, pose='arms', lit=True, robe='#8A6A4A')], ['rays', 'fog'], at='revivió', trans='flare')]),
S('night', 'En el camino, Dios le habló a Jacob en una visión de noche: no temas descender a Egipto, porque allí haré de ti una gran *nación*.', [
    sh(['hills', E('tent', .5)] + STARS, 'rise', [JAC(.4, pose='kneel', lit=True, robe='#8A6A4A')], ['rays', 'dust'], light=dict(x=.5, y=.12))]),
S('golden', 'José preparó su carro y salió a recibirlo. Y cuando lo vio, se echó sobre su cuello... y lloró sobre su cuello *largamente*.', [
    sh(EGYPT, 'panL', [JE(.6, depth='mid')], ['dust']),
    sh(['dunes', E('palm', .2), E('palm', .82)], 'push', [JE(.47), JAC(.55, lit=True, robe='#8A6A4A')], ['rays', 'dust'], at='vio', focus=dict(x=.5, y=.55))]),
S('golden', 'Veintidós años. El hijo que Jacob había llorado como muerto estaba *vivo*, entre sus brazos. Ahora ya puedo morir, le dijo, porque he visto tu *rostro*.', [
    sh(['dunes', E('palm', .2)], 'push', [JE(.47, glow=True), JAC(.55, lit=True, robe='#8A6A4A')], ['rays'], focus=dict(x=.5, y=.5))]),

# ======== 9. Dios lo encaminó a bien ========
S('dusk', 'Pasaron diecisiete años. Jacob bendijo a sus hijos y murió en Egipto. Y los hermanos de José tuvieron *miedo*: ahora sí se va a *vengar*.', [
    sh(['hills', E('cypress', .3), E('cypress', .7)], 'push', [dict(who='mourners', x=.5, n=6, pose='bow')], ['fog']),
    sh([E('palace', .5)], 'push', [BROS(.5, 7)], ['dust'], at='miedo', mood='night')], chapter=('CAPÍTULO 9', 'Dios lo encaminó a bien')),
S('night', 'Le mandaron a pedir perdón, y José *lloró*. Luego fueron y se postraron ante él: aquí estamos, somos tus *siervos*.', [
    sh([E('palace', .5)], 'tiltDown', [JE(.5, depth='mid'), BROS(.5, 8, pose='bow')], ['dust'])]),
S('holy', 'Y les dijo las palabras que resumen toda su vida: ustedes pensaron *mal* contra mí, pero *Dios* lo encaminó a *bien*, para mantener con vida a mucho pueblo.', [
    sh([E('palace', .5)], 'push', [JE(.5, glow=True, pose='open'), BROS(.25, 3, pose='bow'), BROS(.75, 3, pose='bow')], ['rays', 'dust'], focus=dict(x=.5, y=.5)),
    sh(['ground', E('wheat', .5, n=44, gap=50, lit=True), E('granary', .5, depth='far', lit=True)], 'rise', [], ['rays', 'dust'], at='mantener')], trans='flare', climax=True),
S('golden', 'No tengan miedo, les dijo. Yo los voy a cuidar a ustedes y a sus hijos. Y les habló al *corazón*.', [
    sh([E('palace', .5), E('palm', .15)], 'pull', [JE(.45), BROS(.65, 5), dict(who='child', x=.3), dict(who='child', x=.8)], ['rays'])]),
S('dusk', 'José vivió ciento diez años. Antes de morir, pidió que algún día llevaran sus huesos a la tierra *prometida*. Siglos después, Moisés los sacó de Egipto, y fueron enterrados en *Siquem*.', [
    sh(EGYPT, 'pull', [JE(.5, pose='bow', depth='mid')], ['dust']),
    sh(['hills', E('olive', .25), E('olive', .7), E('cypress', .85)], 'push', [dict(who='crowd', x=.5, n=6, depth='mid')], ['fog'], at='Siglos', mood='dawn')]),
S('dawn', 'Siquem. El mismo lugar adonde su padre lo había enviado a buscar a sus hermanos, el día que todo se *rompió*. La historia terminó donde empezó... pero *redimida*.', [
    sh(['hills', E('olive', .2), E('sheep', .6)], 'push', [J(.45, depth='mid')], ['fog']),
    sh(['hills', E('olive', .2), E('olive', .8)], 'rise', [], ['rays', 'fog'], at='redimida', mood='golden', trans='flare')]),

# ======== cierre ========
S('night', 'Tal vez hoy tú estás en tu *cisterna*. O en tu cárcel, esperando que alguien se acuerde de ti. José pasó trece años ahí. Y ni un solo día Dios lo *soltó*.', [
    sh([E('pit', .5), 'rocks'], 'push', [], ['fog', 'dust'], focus=dict(x=.5, y=.72)),
    sh([E('prison', .5, wx=0)], 'push', [dict(who='robed', x=.5, glow=True, pose='pray')], ['rays'], at='José')], trans='dip'),
S('holy', 'Lo que otros pensaron para mal, Dios lo puede encaminar a *bien*. Si crees eso para tu vida, escribe *AMÉN*. Y cuéntame: ¿en qué parte de la historia de José estás tú hoy?', [
    sh(['hills', E('olive', .2), E('olive', .82)], 'rise', [dict(who='robed', x=.5, pose='arms', lit=True, robe='#EFE7D6', glow=True)], ['rays', 'dust'], light=dict(x=.5, y=.12))], trans='flare'),
S('golden', 'Comparte esta historia con alguien que hoy esté en su cisterna. Y suscríbete para más historias de la *Biblia*.', [
    sh(['ground', E('wheat', .5, n=44, gap=50, lit=True)], 'pull', [J(.5, depth='near')], ['rays', 'dust'])]),
]

G = dict(
    slug='jose-el-sonador', style='cinematico', format='16:9', voice='em_santa', speed=1.0,
    title='De esclavo a gobernador de Egipto: la historia completa de José | Génesis 37–50',
    title_card=dict(text='José,<br>el soñador', sub='Génesis 37–50', dur=3.6),
    pronunciation={},
    caption='Vendido por sus propios hermanos a los 17 años… y gobernador de Egipto a los 30. 🌾✨\n\nLa historia completa de José, el soñador (Génesis 37–50): la túnica de colores, la cisterna, la cárcel, los sueños del faraón y un llanto que se escuchó hasta en la casa del faraón.\n\n«Ustedes pensaron mal contra mí, pero Dios lo encaminó a bien» (Génesis 50:20).\n\nCapítulos:\n0:00 Introducción\n0:32 Capítulo 1: El hijo favorito\n1:25 Capítulo 2: La cisterna\n2:45 Capítulo 3: Esclavo en Egipto\n3:31 Capítulo 4: Olvidado\n4:29 Capítulo 5: Los sueños del faraón\n5:53 Capítulo 6: Frente a frente\n7:40 Capítulo 7: Yo soy José\n8:18 Capítulo 8: El reencuentro\n9:05 Capítulo 9: Dios lo encaminó a bien\n\n🙏 Si crees que Dios puede encaminar a bien lo que otros pensaron para mal, escribe AMÉN. Y cuéntame en los comentarios: ¿en qué parte de la historia de José estás tú hoy?\n\nVideo animado con apoyo de inteligencia artificial. Narración basada en el texto bíblico de Génesis 37–50.',
    hashtags=['biblia','historiasbiblicas','jose','genesis','fe','dios','historiasdelabiblia'],
    scenes=scenes,
)
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'jose-el-sonador.json')
json.dump(G, open(out, 'w'), ensure_ascii=False, indent=1)
words = sum(len(s['vo'].split()) for s in scenes)
print(out, len(scenes), 'escenas', words, 'palabras')
