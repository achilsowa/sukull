/**
 * Created by tchapda gabi on 12/06/2015.
 */

sukuApp.factory('TranslateService', [function (){
    var Translate =  {
        lang: 'en',
        elts: {}
    };

    Translate.lang = 'fr';

    // app/
    Translate.elts['Classrooms'] = {en: 'Classrooms', fr: 'Classes'};
    Translate.elts['Tests'] = {en: 'Tests', fr: 'Tests'};
    Translate.elts['Colleagues'] = {en: 'Colleagues', fr: 'Collegues'};
    Translate.elts['All classrooms'] = {en: 'All classrooms', fr: 'Toutes les classes'};
    Translate.elts['All tests'] = {en: 'All tests', fr: 'Tous les tests'};
    Translate.elts['Invite a colleague on sukull'] = {en: 'Invite a colleague on sukull', fr: 'Inviter un colleague sur sukull'};
    Translate.elts['Profile'] = {en: 'Profile', fr: 'Profil'};
    Translate.elts['Settings'] = {en: 'Settings', fr: 'Parametres'};
    Translate.elts['Logout'] = {en: 'Logout', fr: 'Deconnexion'};

    // app/contextual-menu
    Translate.elts['Open'] = {en: 'Open', fr: 'Ouvrir'};
    Translate.elts['Edit'] = {en: 'Edit', fr: 'Modifier'};
    Translate.elts['Delete'] = {en: 'Delete', fr: 'Supprimer'};

    // app/auth-modal
    Translate.elts['Your are not authenticated or your session has ended'] = {
        en: 'Your are not authenticated or your session has ended',
        fr: 'Vous n\'est pas connecte, ou votre session est terminee'
    };
    Translate.elts['Close'] = {en: 'Close', fr: 'Fermer'};
    Translate.elts['Sign in'] = {en: 'Sign in', fr: 'Se connecter'};

    // app/chart-view
    Translate.elts['Chart Editor'] = {en: 'Chart Editor', fr:'Editeur Graphique'};
    Translate.elts['Data range'] = {en: 'Data range', fr:'Domaine'};
    Translate.elts['Graphic type'] = {en: 'Graphic type', fr:'Type de Graphique'};
    Translate.elts['Column'] = {en: 'Column', fr:'Colonne'},
    Translate.elts['Line'] = {en: 'Line', fr: 'Ligne'},
    Translate.elts['Polar-Area'] = {en: 'Polar-Area', fr:'Polar-Area'};
    Translate.elts['Radar'] = {en: 'Radar', fr:'Radar'};
    Translate.elts['Pie, Doughnut'] = {en: 'Pie, Doughnut', fr: 'Pie, Doughnut'};
    Translate.elts['Data series in rows'] = {en: 'Data series in rows', fr: 'Series en ligne'};
    Translate.elts['Data series in columns'] = {en: 'Data series in columns', fr: 'Series en colonnes'};

    // app/classroom-properties-modal
    Translate.elts['Properties'] = {en: 'Properties', fr:'Proprietes'};
    Translate.elts['Effectif'] = {en: 'Effectif', fr: 'Effectif'};
    Translate.elts['Male'] = {en: 'Male', fr:'Homme'};
    Translate.elts['Female'] = {en: 'Female', fr: 'Femme'};
    Translate.elts['Attachments'] = {en: 'Attachments', fr: 'Fichies attaches'};
    Translate.elts['Attach a file'] = {en: 'Attach a file', fr:'Attacher un fichier'};
    Translate.elts['Activity'] = {en: 'Activity', fr:'Activite'};
    Translate.elts['comment'] = {en: 'comment', fr:'commentaire'};
    Translate.elts['Comment'] = {en: 'Comment', fr:'Commentez'}

    // app/execel-view
    Translate.elts['name'] = {en: 'name', fr: 'nom'};
    Translate.elts['sexe'] = {en: 'sexe', fr: 'sexe'};
    Translate.elts['Male'] = {en: 'Male', fr: 'Homme'};
    Translate.elts['Female'] = {en: 'Female', fr: 'Femme'};
    Translate.elts['Success'] = {en: 'Success', fr: 'Succes'};
    Translate.elts['Fail'] = {en: 'Fail', fr: 'Echec'};
    Translate.elts['result'] = {en: 'result', fr: 'resultat'};
    Translate.elts['sexe-result'] = {en: 'sexe-result', fr: 'sexe-resultat'};
    Translate.elts['appreciation'] = {en: 'appreciation', fr: 'appreciation'};
    Translate.elts['Male-Success'] = {en: 'Male-Success', fr: 'Homme-Succes'};
    Translate.elts['Female-Success'] = {en: 'Female-Success', fr: 'Femme-Succes'};
    Translate.elts['Male-Fail'] = {en: 'Male-Fail', fr: 'Homme-Echec'};
    Translate.elts['Female-Fail'] = {en: 'Female-Fail', fr: 'Femme-Echec'};
    Translate.elts['Undo'] = {en: 'Undo', fr: 'Annuler'};
    Translate.elts['Redo'] = {en: 'Redo', fr: 'Re-Annuler'};
    Translate.elts['Cut'] = {en: 'Cut', fr: 'Couper'};
    Translate.elts['Copy'] = {en: 'Copy', fr: 'Copier'};
    Translate.elts['Paste'] = {en: 'Paste', fr: 'Coller'};
    Translate.elts['Remove row'] = {en: 'Remove row', fr: 'Supprimer ligne'};
    Translate.elts['Remove column'] = {en: 'Remove column', fr: 'Supprimer colonne'};
    Translate.elts['Insert row'] = {en: 'Insert row', fr: 'Inserer ligne'};
    Translate.elts['Insert column'] = {en: 'Insert column', fr: 'Inserer colonne'};
    Translate.elts['Insert graphic'] = {en: 'Insert graphic', fr: 'Inserer un graphique'};
    Translate.elts['Editx'] = {en: 'Edit', fr:'Edition'};
    Translate.elts['Insert'] = {en: 'Insert', fr:'Insertion'};


    // app/import-students-modal
    Translate.elts['Upload the text file'] = {en: 'Upload the text file', fr: 'Uploader le fichier texte'};
    Translate.elts['You must import the students from a text file (.txt or .text)'] = {
        en: 'You must import the students from a text file (.txt or .text)',
        fr: 'Importez les eleves a partir d\' fichier texte (.txt or .text)'
    };
    Translate.elts['Each line in the file must contain the name of one student'] = {
        en: 'Each line in the file must contain the name of one student',
        fr: 'Chaque line du fichier devra contenir le nom d\'un eleve'
    };

    Translate.elts['If your student file is not a text file (pdf, excel, word, ...)'] = {
        en: 'If your student file is not a text file (pdf, excel, word, ...)',
        fr: 'Si votre fichier n\'est pas un fichier text (pdf, excel, word, ...)'
    };

    Translate.elts['open your text editor (notepad, bloc note, emacs ...)'] = {
        en:'open your text editor (notepad, bloc note, emacs ...)',
        fr:'ouverz votre editeur de texte (notepad, bloc note, emacs ...)'
    };

    Translate.elts['copy the students\' names in that file, each name on it\'s own line and save the file with the extension .txt or .text'] = {
        en: 'copy the students\' name in that file, each name on it\'s own line and save the file with the extension .txt or .text',
        fr: 'entrez le nom des eleves, chaque nom sur une sa ligne, et sauvegardez le fichier avec l\'extension .txt or .text'
    };

    Translate.elts['Then import it via this assistant.'] = {
        en: 'Then import it via this assistant.', fr: 'Ensuite, importez le fichier via l\'assistant'
    };

    Translate.elts['The other students\' information (email, phone ...) must be filled later'] = {
        en: 'The other students\' information (email, sexe ...) must be filled later',
        fr: 'Les autres informations (email, sexe ...) seront remplies plus tard'
    };

    Translate.elts['The imported students will be added to students already present in the classroom before'] = {
        en: 'The imported students will be added to students already present in the classroom before',
        fr: 'Les nouveaux eleves seront ajoutes a ceux precedemment presents dans la classe'
    };

    Translate.elts['Send'] = {en: 'Send', fr:'Envoyer'};

    // app/invite-user-modal
    Translate.elts['Enter your colleague\'s email'] = {en: 'Enter your colleague\'s email', fr:'Entrez l\'email de votre collegue'};
    Translate.elts['You may want to share some of your classroom with him'] =
        {en: 'You may want to share some of your classroom with him', fr:'Vous pouvez partager certaines de vos classes avec lui'};
    Translate.elts['Invite'] = {en: 'Invite', fr:'Inviter'};

    // app/save-classrooms-modal
    Translate.elts['Name'] = {en: 'Name', fr: 'Nom'};
    Translate.elts['School'] = {en: 'School', fr: 'Etablissement'};
    Translate.elts['Classroom'] = {en: 'Classroom', fr: 'classe'};
    Translate.elts['classroom name'] = {en: 'classroom name', fr: 'nom classe'};
    Translate.elts['school name'] = {en: 'school name', fr: 'nom etablissement'};


    Translate.elts['Save'] = {en: 'Save', fr: 'Sauvegarder'};


    // app/classrooms
    Translate.elts['New Classroom'] = {en: 'New Classroom', fr: 'Nouvelle Classe'};

    // app/classrooms/:id
    Translate.elts['New Test'] = {en: 'New Test', fr: 'Nouveau Test'};
    Translate.elts['New Student'] = {en: 'New Student', fr: 'Nouvel Eleve'};
    Translate.elts['Import Students'] = {en: 'Import Students', fr: 'Importer Eleves'};
    Translate.elts['Share Classroom'] = {en: 'Share Classroom', fr: 'Partager la Classe'};
    Translate.elts['Details'] = {en: 'Details', fr: 'Details'};
    Translate.elts['Code'] = {en: 'Code', fr: 'Code'};
    Translate.elts['Date'] = {en: 'Date', fr: 'Date'};
    Translate.elts['Subject'] = {en: 'Subject', fr: 'Matiere'};
    Translate.elts['Name'] = {en: 'Name', fr: 'Nom'};
    Translate.elts['Email'] = {en: 'Email', fr: 'Email'};
    Translate.elts['Sexe'] = {en: 'Sexe', fr: 'Sexe'};





    // app/tests/:id
    Translate.elts['Notify Students'] = {en: 'Notify Students', fr: 'Notifier les Eleves'};
    Translate.elts['Share Test'] = {en: 'Share Test', fr: 'Partager le Test'};




    Translate.tr = function(msg, $a, $b, $c, $d, $e, $f) {
        if (Translate.elts[msg]) return Translate.elts[msg][Translate.lang];
        return msg;
    };
    return Translate;
}]);
