<?php
class ConnexionBaseDeDonnee {
    public static function getPdo() {
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

function insererTuple() {
    $pdo = ConnexionBaseDeDonnee::getPdo();
    $requete = $pdo->prepare("INSERT INTO `NotationTetris`(`idPartie`,`nomJoueur`, `score`, `temps`, `date`) VALUES (NULL , :nomJoueur, :score, :temps, :date)");
    $requete->execute(array(
        'nomJoueur' => $_POST['nomJoueur'],
        'score' => $_POST['score'],
        'temps' => $_POST['temps'],
        'date' => date("Y-m-d H:i:s")
    ));
}

// Vérifier si la requête est de type POST et si les paramètres nécessaires sont présents
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['nomJoueur'], $_POST['score'], $_POST['temps'])) {
    insererTuple();
    echo "Tuple inséré avec succès.";
} else {
    echo "Paramètres manquants ou méthode non autorisée.";
}
?>