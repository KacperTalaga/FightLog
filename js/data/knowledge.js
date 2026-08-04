/* Baza wiedzy — treść statyczna, wbudowana w aplikację, żeby działała offline.

   `body` to zaufany HTML pisany w repo, nie dane od użytkownika, więc trafia
   do innerHTML bez ucieczki znaków. Gdyby kiedyś sekcje miały być edytowalne
   z poziomu aplikacji, trzeba to zmienić. */

export const KNOWLEDGE = [
    {
        id: 'progresja',
        title: 'System progresji',
        tags: 'double progression zakres powtórzeń ciężar increment deload stagnacja',
        body: `
        <p>Aplikacja prowadzi <strong>podwójną progresję</strong>: najpierw rośnie liczba powtórzeń
        w zakresie, potem ciężar.</p>
        <ol>
            <li>Startujesz z dolną granicą zakresu, np. 70 kg × 6 przy zakresie 6–10.</li>
            <li>Co sesję celujesz o jedno powtórzenie wyżej, przy tym samym ciężarze.</li>
            <li>Gdy <em>wszystkie</em> zaplanowane serie trafią w górną granicę (4 × 10),
                ciężar rośnie o przyrost ćwiczenia, a powtórzenia wracają na dół zakresu.</li>
        </ol>
        <p>Trzy udane serie z czterech to jeszcze nie zamknięty zakres — silnik nie podbije wtedy
        ciężaru. To celowe: podbicie na niedokończonej sesji przenosi zmęczenie na kolejny tydzień.</p>
        <p><strong>Stagnacja</strong> to trzy sesje z rzędu na tym samym ciężarze roboczym. Aplikacja
        oznacza wtedy ćwiczenie i proponuje deload. <strong>Deload</strong> wypada automatycznie co
        piąty tydzień od pierwszej zapisanej sesji: ta sama struktura treningu, 55% ciężaru.</p>
        <p>Przy ćwiczeniach z masy ciała deload obcina wyłącznie dołożone obciążenie — masy własnego
        ciała nie da się zdjąć.</p>`
    },
    {
        id: 'zmiana-cwiczen',
        title: 'Kiedy zmieniać ćwiczenia',
        tags: 'rotacja wariant plateau technika ból nuda',
        body: `
        <p>Ćwiczenie zmieniasz, gdy przestaje robić robotę — nie gdy się znudziło. Przesłanki, w tej
        kolejności:</p>
        <ul>
            <li><strong>Ból lub kolizja z treningiem walki.</strong> Zmiana natychmiast, bez dyskusji.</li>
            <li><strong>Stagnacja mimo deloadu.</strong> Trzy sesje bez progresu, deload nie odblokował →
                zmień wariant (inny kąt, inny sprzęt, inny zakres ruchu).</li>
            <li><strong>8–12 tygodni bez zmiany.</strong> Wymiana na wariant tego samego wzorca ruchowego
                odświeża bodziec, a nie resetuje progresji.</li>
        </ul>
        <p>Czego nie robić: nie zmieniaj ćwiczeń bazowych co blok. Wyciskanie, podciąganie i przysiad
        w jakiejś formie zostają — rotujesz akcesoria i izolację. Progresja liczy się per ćwiczenie,
        więc każda zamiana zeruje historię i sugestie startują od nowa.</p>`
    },
    {
        id: 'objetosc',
        title: 'Objętość tygodniowa',
        tags: 'serie tygodniowo hipertrofia dawka odpowiedź schoenfeld pelland',
        body: `
        <p>Robocze widełki: <strong>10–20 serii tygodniowo na partię mięśniową</strong>. Poniżej 10
        bodziec jest zwykle zbyt mały, powyżej 20 przyrost korzyści maleje, a koszt regeneracyjny
        rośnie — przy trzech sesjach walki w tygodniu to realny problem.</p>
        <p>W zakładce <strong>Progresja</strong> objętość liczona jest tak: seria zalicza się 1.0 do
        partii głównej i 0.5 do wspomagającej. Wyciskanie to 1.0 klatki oraz po 0.5 tricepsa i barków.</p>
        <p>Objętość to nie to samo co tonaż. Do wykresu tygodniowego wchodzi tonaż
        (serie × powtórzenia × ciężar), do celu 10–20 — liczba serii.</p>
        <p>Sporty walki dokładają objętości nogom i core, której nie widać w logu siłowni. Jeśli
        regeneracja siada, tnij najpierw akcesoria na nogi, nie ćwiczenia bazowe.</p>`
    },
    {
        id: 'interferencja',
        title: 'Efekt interferencji (AMPK / mTOR)',
        tags: 'concurrent training wytrzymałość cardio kolizja ampk mtor kickboxing',
        body: `
        <p>Wysiłek wytrzymałościowy aktywuje szlak <strong>AMPK</strong>, sygnalizujący deficyt energii.
        Trening siłowy działa przez <strong>mTOR</strong>, szlak budowy białka. AMPK tłumi mTOR, więc
        conditioning wykonany blisko treningu siłowego może przyciąć odpowiedź anaboliczną.</p>
        <p>Skala efektu jest umiarkowana i zależy od objętości oraz typu wysiłku — bieganie koliduje
        mocniej niż rower, długie wolne wybieganie mocniej niż interwały. Przy twoim rozkładzie
        (3 × walki + 3 × siłownia) interferencja jest wpisana w plan i nie da się jej wyzerować.
        Da się ją ograniczyć:</p>
        <ul>
            <li>Odstęp <strong>minimum 6 godzin</strong> między sesją siłową a conditioningiem, jeśli
                wypadają tego samego dnia.</li>
            <li>Siła <strong>przed</strong> wytrzymałością, gdy muszą być w jednej sesji.</li>
            <li>Nogi rozłożone tak, żeby ciężki dzień nóg nie sąsiadował z najcięższym sparingiem.</li>
            <li>Finisher HIIT jest krótki celowo — dokłada kondycji bez wchodzenia w objętość, która
                realnie koliduje.</li>
        </ul>`
    },
    {
        id: 'bialko',
        title: 'Białko i okno potreningowe',
        tags: 'białko protein issn gram kilogram cut redukcja whey macnaughton',
        body: `
        <p>Stanowisko <strong>ISSN</strong>: <strong>1.4–2.0 g/kg masy ciała</strong> dziennie dla osób
        trenujących siłowo. Na <strong>redukcji 2.0–2.2 g/kg</strong> — wyższa podaż chroni masę
        mięśniową przy deficycie, co przy schodzeniu do kategorii wagowej jest całym sensem operacji.</p>
        <p>Przy 79 kg to 158–174 g dziennie, przy cięciu do 75 kg — około 165 g. Cel w zakładce
        <strong>Dieta</strong> jest ustawiony na 170 g.</p>
        <p><strong>Okno potreningowe: 20–40 g białka do 2 godzin po treningu.</strong> Macnaughton 2016
        pokazał, że po treningu angażującym całe ciało 40 g daje wyższą syntezę białek mięśniowych niż
        20 g — czyli przy dużych sesjach warto celować w górną granicę. Samo „okno" jest szersze, niż
        głosi mit: całodniowa podaż i rozłożenie na 3–5 porcji ważą więcej niż to, czy shake wypijesz
        po 20 czy 90 minutach.</p>`
    },
    {
        id: 'wegle-tluszcze',
        title: 'Węglowodany i tłuszcze',
        tags: 'węglowodany glikogen tłuszcz hormony conditioning uzupełnienie',
        body: `
        <p><strong>Węglowodany: 1–1.2 g/kg w posiłku po conditioningu</strong> — po sesji walki
        z wysokim tętnem glikogen mięśniowy jest realnie nadwyrężony, a jego odbudowa decyduje o tym,
        jak wyglądasz na kolejnym treningu. Przy 79 kg to 79–95 g węglowodanów.</p>
        <p><strong>Tłuszcz: minimum 0.7 g/kg</strong> dziennie. Schodzenie niżej na dłuższej redukcji
        uderza w gospodarkę hormonalną i sen, a oszczędność kaloryczna jest pozorna — te kalorie
        i tak trzeba skądś wziąć.</p>
        <p>Przy 79 kg to minimum 55 g tłuszczu. Cel w zakładce <strong>Dieta</strong> stoi na 75 g,
        czyli z zapasem.</p>
        <p>Kolejność cięcia kalorii przy zastoju: najpierw węglowodany w dni bez treningu, potem
        tłuszcz do podłogi 0.7 g/kg. Białka nie tykasz.</p>`
    },
    {
        id: 'regeneracja',
        title: 'Hierarchia regeneracji',
        tags: 'sen odżywianie regeneracja rolowanie masaż suplementy priorytet',
        body: `
        <p>Kolejność ma znaczenie — dopiero gdy wyżej jest zrobione, niższe zaczyna cokolwiek dawać:</p>
        <ol>
            <li><strong>Sen.</strong> 7–9 godzin, stała pora. Nic poniżej tego punktu nie nadrobi
                chronicznego niedoboru snu.</li>
            <li><strong>Odżywianie.</strong> Podaż kalorii i białka, nawodnienie.</li>
            <li><strong>Aktywna regeneracja.</strong> Spacer, lekka mobilność, rolowanie
                — przyspieszają powrót, ale nie zastępują dwóch punktów wyżej.</li>
            <li><strong>Reszta.</strong> Masaż, sauna, kompresja, suplementy. Efekt realny,
                ale marginalny wobec powyższych.</li>
        </ol>
        <p>Sześć sesji w tygodniu to obciążenie, przy którym niedobór snu wychodzi najpierw
        w sparingach, a dopiero potem w siłowni.</p>`
    },
    {
        id: 'zimna-woda',
        title: 'Zimna woda po treningu — uwaga',
        tags: 'cwi lodowa kąpiel morsowanie regeneracja roberts hipertrofia',
        body: `
        <p><strong>Nie bierz zimnej kąpieli po treningu siłowym.</strong> Roberts 2015 pokazał, że
        zanurzenie w zimnej wodzie (CWI) bezpośrednio po sesji oporowej tłumi ostrą sygnalizację
        anaboliczną i po kilku tygodniach przekłada się na mniejsze przyrosty siły i masy niż
        aktywna regeneracja.</p>
        <p>Kiedy CWI ma sens: po sparingu albo turnieju, gdy priorytetem jest odzyskanie zdolności
        do kolejnej walki w krótkim czasie, a nie budowa masy. Wtedy tłumienie stanu zapalnego
        pracuje na ciebie.</p>
        <p>Reguła praktyczna: zimno po walce — tak. Zimno po siłowni — nie, albo z odstępem
        kilku godzin.</p>`
    },
    {
        id: 'badania',
        title: 'Kluczowe badania',
        tags: 'źródła literatura meta-analiza franchini schoenfeld pelland cid-calfucura macnaughton roberts',
        body: `
        <ul>
            <li><strong>Schoenfeld, Ogborn, Krieger 2017</strong> — meta-analiza zależności
                dawka–odpowiedź: hipertrofia rośnie wraz z tygodniową liczbą serii, wyraźna przewaga
                przy 10+ seriach na partię tygodniowo. Podstawa widełek 10–20.</li>
            <li><strong>Schoenfeld i wsp. 2016</strong> — meta-analiza częstotliwości: przy zrównanej
                objętości tygodniowej rozbicie partii na dwie sesje wypada lepiej niż jedna.
                Stąd plecy i nogi dwa razy w tygodniu.</li>
            <li><strong>Pelland i wsp. 2024</strong> — meta-regresja objętości: korzyść z dokładania
                serii utrzymuje się dalej, niż sądzono, ale z wyraźnie malejącym zwrotem. Siła zyskuje
                na objętości mniej niż hipertrofia.</li>
            <li><strong>Macnaughton i wsp. 2016</strong> — 40 g białka serwatkowego po treningu całego
                ciała daje wyższą syntezę białek mięśniowych niż 20 g. Podstawa okna 20–40 g.</li>
            <li><strong>Roberts i wsp. 2015</strong> — zanurzenie w zimnej wodzie po treningu oporowym
                tłumi adaptacje siłowe i hipertroficzne względem aktywnej regeneracji.</li>
            <li><strong>Franchini 2023</strong> — przegląd treningu siły i mocy w sportach walki:
                nacisk na moc i utrzymanie masy mięśniowej w obrębie kategorii wagowej.</li>
            <li><strong>Cid-Calfucura i wsp. 2023</strong> — przegląd efektów treningu oporowego
                u zawodników sportów walki: poprawa siły i mocy bez szkody dla parametrów technicznych.</li>
        </ul>
        <p class="knowledge__note">Dwie pozycje z listy źródłowej — <strong>Collins 2014</strong>
        i <strong>Williams 2017</strong> — nie zostały tu opisane, bo nie mam pewności, do których
        prac się odnoszą. Podaj pełne tytuły, a zostaną dopisane.</p>`
    }
];
