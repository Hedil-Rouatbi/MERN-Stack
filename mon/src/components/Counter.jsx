import { useState, useEffect, useCallback } from 'react';

// DÉFI 1 : bornes limites
const MAX = 50;
const MIN = -50;

export default function Counter() {

    // 1. Initialisation à 0
    const [count, setCount] = useState(0);
    const [estCharge, setEstCharge] = useState(false);

    const [step, setStep] = useState(1);
    const [message, setMessage] = useState('Aucun clic pour le moment');
    const [totalClics, setTotalClics] = useState(0);
    const [historique, setHistorique] = useState([]);

    // Gestionnaire d'incrementation (DÉFI 3 : useCallback)
    const handleIncrement = useCallback(() => {
        const nouveauCompte = count + step;

        // DÉFI 1 : on bloque si on dépasse +50
        if (nouveauCompte > MAX) {
            setMessage('Seuil maximal de 50 atteint !');
            return; 
        }

        setCount(nouveauCompte);
        setMessage('Ajout de ' + step);
        setTotalClics(totalClics + 1);
        const action = '+' + step;
        setHistorique([...historique, action]);
    }, [count, step, totalClics, historique]);

    // Gestionnaire de decrementation (DÉFI 3 : useCallback)
    const handleDecrement = useCallback(() => {
        const nouveauCompte = count - step;

        // DÉFI 1 : on bloque si on descend sous -50
        if (nouveauCompte < MIN) {
            setMessage('Seuil minimal de -50 atteint !');
            return;
        }

        setCount(nouveauCompte);
        setMessage('Retrait de ' + step);
        setTotalClics(totalClics + 1);
        const action = '-' + step;
        setHistorique([...historique, action]);
    }, [count, step, totalClics, historique]);

    // Gestionnaire de remise a zero
    const handleReset = () => {
        setCount(0);
        setMessage('Remise a zero');
        setTotalClics(totalClics + 1);
        setHistorique([]);
    };

    // Couleur dynamique selon le signe du compteur
    const getStyleClass = () => {
        if (count > 0) return 'counter-display positive';
        if (count < 0) return 'counter-display negative';
        return 'counter-display zero';
    };

    // EFFET 1 : Charger la valeur ET l'historique du localStorage au démarrage
    useEffect(() => {
        const sauvegarde = localStorage.getItem('mon_compteur_valeur');
        if (sauvegarde !== null) {
            setCount(parseInt(sauvegarde, 10));
        }

        // DÉFI 2 : restaurer l'historique (chaîne JSON -> tableau)
        const historiqueSauve = localStorage.getItem('mon_compteur_historique');
        if (historiqueSauve !== null) {
            try {
                setHistorique(JSON.parse(historiqueSauve));
            } catch {
                setHistorique([]); // donnée corrompue : tableau vide
            }
        }

        setEstCharge(true);
    }, []);

    // EFFET 2 : Sauvegarder automatiquement à chaque changement de count
    useEffect(() => {
        if (!estCharge) return;
        localStorage.setItem('mon_compteur_valeur', count.toString());
    }, [count, estCharge]);

    // DÉFI 2 - EFFET 3 : Sauvegarder l'historique à chaque changement (tableau -> chaîne JSON)
    useEffect(() => {
        if (!estCharge) return; // évite d'écraser la sauvegarde avec [] au premier rendu
        localStorage.setItem('mon_compteur_historique', JSON.stringify(historique));
    }, [historique, estCharge]);

    // DÉFI 3 - EFFET 4 : Contrôle du compteur au clavier
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault(); // empêche la page de défiler
                handleIncrement();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                handleDecrement();
            }
        };

        // 1. On attache l'écouteur sur window
        window.addEventListener('keydown', handleKeyDown);

        // 2. FONCTION DE NETTOYAGE : on détache l'écouteur
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleIncrement, handleDecrement]);

    return (
        <div className="counter-card">
            <div className={getStyleClass()}>{count}</div>

            <div className="btn-group">
                {/* DÉFI 1 : bouton désactivé si on ne peut plus descendre */}
                <button
                    className="btn btn-dec"
                    onClick={handleDecrement}
                    disabled={count - step < MIN}
                >
                    -{step}
                </button>

                <button className="btn btn-reset" onClick={handleReset}>
                    Reset
                </button>

                {/* DÉFI 1 : bouton désactivé si on ne peut plus monter */}
                <button
                    className="btn btn-inc"
                    onClick={handleIncrement}
                    disabled={count + step > MAX}
                >
                    +{step}
                </button>
            </div>

            <div className="step-control">
                <label>Pas d'incrementation :</label>
                <select
                    value={step}
                    onChange={(e) => setStep(parseInt(e.target.value, 10))}
                >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                </select>
            </div>

            <div className="history-card">
                <p>
                    <strong>Derniere action :</strong> {message}
                </p>

                {/* DÉFI 1 : alerte visuelle en rouge quand une limite est atteinte */}
                {(count + step > MAX || count - step < MIN) && (
                    <p style={{ color: 'red', fontWeight: 'bold' }}>
                        {count + step > MAX
                            ? 'Seuil maximal de 50 atteint !'
                            : 'Seuil minimal de -50 atteint !'}
                    </p>
                )}

                <p>
                    <strong>Total des clics :</strong> {totalClics}
                </p>

                {historique.length > 0 && (
                    <p>
                        <strong>Historique :</strong> {historique.join(', ')}
                    </p>
                )}
            </div>
        </div>
    );
}