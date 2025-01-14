<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error 404 - Tetris</title>
    <link rel="stylesheet" href="../../css/style.css">
</head>


<style>

    body {
        text-align: center;

    }

    #gameMessage, #startMessage {
        position: absolute;
        top: 27%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(126, 93, 93, 0.6); /* Fond transparent */
        padding: 20px;
        border-radius: 10px;
        text-align: center;
    }


    .hidden {
        display: none;
    }

    button {
        padding: 10px 20px;
        background-color: #22B8C7;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    button:hover {
        background-color: #1a919d;
    }

    canvas {
        border: 1px solid #000;
    }

    #nextPieceCanvas {
        border: 1px solid #000;
        margin-left: 20px; /* Adjust the margin as needed */
    }

    #usernameInput {
        width: 200px; /* Largeur du champ de texte */
        padding: 10px; /* Espacement interne du champ de texte */
        font-size: 16px; /* Taille de la police */
        border: 1px solid #ccc; /* Bordure du champ de texte */
        border-radius: 5px; /* Bordure arrondie */
        margin-right: 10px; /* Marge à droite pour l'espacement du bouton */
    }

</style>


<body>
<audio id="myAudio" autoplay loop>
    <source src="musique/%5BJeu%5D%20Musique%20-%20Tetris.mp3" type="audio/mp3">
</audio>
<div id="tetrisPiecesContainer"
     style="position: absolute; width: 100vw; height: 100vh; z-index: 100; transform: translate(-80px,-20px)" ;></div>

<div id="dim" style="visibility: hidden">
    <div style="background: radial-gradient(circle at top left, #051521, #0d2f3a);">
        <h2 id="score">Score: 0</h2>
        <h2 id="level">Level: 0</h2>
        <div id="gameMessage" class="hidden">
            <h2 id="gameMessageText">Victoire ! Félicitations, vous avez perdu votre temps !</h2>
            <label for="usernameInput"></label>
            <input type="text" id="usernameInput" placeholder="Entrez votre nom" minlength="3">
            <button id="endGameBtn" onclick="endGame(); resetGame();" disabled>Fin de partie</button>
        </div>
        <div id="startMessage">
            <h2>Voici notre jeu Tetris 404</h2>
            <h3>404 de score pour gagner</h3>
            <h5>Bonne chance :)</h5>
            <button onclick="startGame()">Jouer</button>
        </div>
        <?php

        class ConnexionBaseDeDonnee
        {
            public static function getPdo()
            {
                // Assurez-vous de configurer correctement votre connexion à la base de données ici
                $hostname = "webinfo.iutmontp.univ-montp2.fr";
                $port = "3316";
                $databaseName = "marteld";
                $login = "marteld";
                $password = "27012005";

                try {
                    $pdo = new PDO("mysql:host=$hostname;port=$port;dbname=$databaseName", $login, $password,
                        array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
                    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    return $pdo;
                } catch (PDOException $e) {
                    die("Erreur de connexion : " . $e->getMessage());
                }
            }
        }

        function getTopScores()
        {
            $pdo = ConnexionBaseDeDonnee::getPdo();
            $requete = $pdo->prepare("SELECT nomJoueur, score, temps FROM NotationTetris ORDER BY score DESC LIMIT 5");
            $requete->execute();
            return $requete->fetchAll(PDO::FETCH_ASSOC);
        }

        // Appel de la fonction et récupération des résultats
        $topScores = getTopScores();
        ?>
        <div style="display: flex;justify-content: center; align-items: center; padding-right: 100px ">
            <div>
                <table>
                    <thead>
                    <tr>
                        <th>Position</th>
                        <th>Joueur</th>
                        <th>Score</th>
                        <th>Temps</th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php
                    $position = 1;
                    foreach ($topScores as $score) {
                        echo "<tr>";
                        echo "<td>{$position}</td>";
                        echo "<td>{$score['nomJoueur']}</td>";
                        echo "<td>{$score['score']}</td>";
                        echo "<td>{$score['temps']}</td>";
                        echo "</tr>";
                        $position++;
                    }
                    ?>
                    </tbody>
                </table>
            </div>
            <div>
                <canvas id="tetrisCanvas" width="300" height="600"></canvas>
                <canvas id="nextPieceCanvas" width="100" height="100"></canvas>
            </div>
        </div>
    </div>
</div>
<script>
    // Fonction pour activer/désactiver le bouton en fonction de la longueur du champ utilisateur
    function updateButtonState() {
        var usernameInput = document.getElementById("usernameInput");
        var endGameBtn = document.getElementById("endGameBtn");

        // Activer le bouton si la longueur du champ utilisateur est supérieure ou égale à 3
        endGameBtn.disabled = usernameInput.value.length < 3;
    }

    // Ajouter un écouteur d'événements pour le champ utilisateur pour mettre à jour le bouton
    document.getElementById("usernameInput").addEventListener("input", updateButtonState);

    document.addEventListener("DOMContentLoaded", function() {
        // Votre code existant...

        // Fonction de comparaison personnalisée pour trier par score puis par temps
        function compareScores(a, b) {
            // Trie par score de manière décroissante
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            // Si les scores sont égaux, trie par temps de manière croissante
            return a.temps - b.temps;
        }

        // Récupérer les données du tableau PHP et les convertir en tableau JavaScript
        var topScores = <?php echo json_encode($topScores); ?>;

        // Trier le tableau en utilisant la fonction de comparaison personnalisée
        topScores.sort(compareScores);

        // Votre code existant...

        // Fonction pour mettre à jour le tableau avec les données triées
        function updateTable() {
            var tableBody = document.querySelector("tbody");
            tableBody.innerHTML = "";

            var position = 1;
            topScores.forEach(function(score) {
                var row = document.createElement("tr");
                row.innerHTML = `
                <td>${position}</td>
                <td>${score.nomJoueur}</td>
                <td>${score.score}</td>
                <td>${score.temps}</td>
            `;
                tableBody.appendChild(row);
                position++;
            });
        }

        // Appeler la fonction pour mettre à jour le tableau initial
        updateTable();

        // Votre code existant...
    });

</script>
<script src="js/mainTetris.js"></script>
</body>
</html>