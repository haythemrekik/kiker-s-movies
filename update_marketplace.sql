-- Mise à jour de la base de données pour la Marketplace (Créateur / Client)

-- 1. Mettre à jour les rôles autorisés (ajout de 'createur' et 'client')
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('admin', 'user', 'createur', 'client'));

-- 2. Ajouter les colonnes owner_id et target_client_id à la table videos
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS target_client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Mettre à jour les politiques RLS de la table videos
-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Authenticated users can view videos" ON public.videos;

-- Nouvelles politiques (Suppression si elles existent déjà pour éviter les erreurs)
DROP POLICY IF EXISTS "Createurs can see their own videos" ON public.videos;
DROP POLICY IF EXISTS "Clients can see videos assigned to them" ON public.videos;
DROP POLICY IF EXISTS "Createurs can insert their own videos" ON public.videos;
DROP POLICY IF EXISTS "Createurs can update their own videos" ON public.videos;
DROP POLICY IF EXISTS "Createurs can delete their own videos" ON public.videos;

CREATE POLICY "Createurs can see their own videos" 
    ON public.videos FOR SELECT 
    USING (auth.uid() = owner_id);

CREATE POLICY "Clients can see videos assigned to them" 
    ON public.videos FOR SELECT 
    USING (auth.uid() = target_client_id);

CREATE POLICY "Createurs can insert their own videos" 
    ON public.videos FOR INSERT 
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Createurs can update their own videos" 
    ON public.videos FOR UPDATE 
    USING (auth.uid() = owner_id);

CREATE POLICY "Createurs can delete their own videos" 
    ON public.videos FOR DELETE 
    USING (auth.uid() = owner_id);

-- La table access_codes a déjà une colonne user_id qui servira pour le client.
